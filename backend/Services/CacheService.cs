namespace MyApi.Services;
using MyApi.Interfaces;
using StackExchange.Redis;
using System.Text.Json;

public class CacheService : ICacheInterface
{
    private readonly IConnectionMultiplexer _redis;
    private readonly ILogger<CacheService> _logger;
    private static readonly JsonSerializerOptions JsonOptions = new JsonSerializerOptions
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
    };

    public CacheService(IConnectionMultiplexer redis, ILogger<CacheService> logger)
    {
        _redis = redis;
        _logger = logger;
    }

    public async Task AddToBlacklistAsync(string jti, TimeSpan ttl)
    {
        var db = _redis.GetDatabase();
        await db.StringSetAsync($"bl:jti:{jti}", "true", ttl);
    }

    public async Task<bool> IsJtiBlacklistedAsync(string jti)
    {
        try
        {
            var db = _redis.GetDatabase();
            var isBlacklisted = await db.StringGetAsync($"bl:jti:{jti}");
            return isBlacklisted.HasValue && isBlacklisted == "true";
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "IsJtiBlacklistedAsync failed for jti {Jti}", jti);
            return false;
        }
    }

    public async Task<bool> CheckSessionTable(string slug)
    {
        var db = _redis.GetDatabase();
        var session = await db.StringGetAsync($"table:session:{slug}");
        return session.HasValue;
    }

    public async Task<T?> GetAsync<T>(string key)
    {
        try
        {
            var db = _redis.GetDatabase();
            var value = await db.StringGetAsync(key);
            if (!value.HasValue || string.IsNullOrEmpty(value.ToString()))
            {
                return default;
            }
            return JsonSerializer.Deserialize<T>(value.ToString(), JsonOptions);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "GetAsync failed for cache key {Key}", key);
            return default;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan ttl)
    {
        try
        {
            var db = _redis.GetDatabase();
            await db.StringSetAsync(key, JsonSerializer.Serialize(value, JsonOptions), ttl);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "SetAsync failed for cache key {Key}", key);
        }
    }

    public async Task RemoveAsync(string key)
    {
        try
        {
            var db = _redis.GetDatabase();
            await db.KeyDeleteAsync(key);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "RemoveAsync failed for cache key {Key}", key);
        }
    }

    public async Task RemoveByPrefixAsync(string prefix)
    {
        try
        {
            var endpoints = _redis.GetEndPoints(true);
            if (endpoints.Length == 0)
            {
                _logger.LogWarning("RemoveByPrefixAsync: no Redis endpoints available for prefix {Prefix}", prefix);
                return;
            }

            var server = _redis.GetServer(endpoints[0]);

            // Scan theo prefix với pageSize hợp lệ (250) và phân trang cursor.
            List<RedisKey> keysToDelete = new List<RedisKey>();
            long cursor = 0;
            do
            {
                var page = server.Keys(0, new RedisValue(prefix + "*"), 250, cursor, 0, CommandFlags.None).ToArray();
                keysToDelete.AddRange(page);
                // Signal end-of-scan bằng cách đặt cursor = 0 khi không còn.
                cursor = 0; // StackExchange.Redis không trả cursor; scan trọn vẹn qua từng batch.
            } while (false);

            if (keysToDelete.Count == 0)
            {
                return;
            }

            var db = _redis.GetDatabase();
            await db.KeyDeleteAsync(keysToDelete.ToArray());
            _logger.LogInformation("RemoveByPrefixAsync: removed {Count} key(s) with prefix {Prefix}", keysToDelete.Count, prefix);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "RemoveByPrefixAsync failed for prefix {Prefix}. Stale cache may persist until TTL expiry.", prefix);
        }
    }
}
