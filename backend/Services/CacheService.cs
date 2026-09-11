namespace MyApi.Services;
using MyApi.Interfaces;
using StackExchange.Redis;

public class CacheService : ICacheInterface
{
    private readonly IConnectionMultiplexer _redis;

    public CacheService(IConnectionMultiplexer redis)
    {
        _redis = redis;
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
        catch
        {
            // If Redis is temporarily unreachable, don't block authenticated requests
            // (otherwise the JWT middleware would return 500 instead of 401 and break
            // the frontend auto-refresh flow).
            return false;
        }
    }

    public async Task<bool> CheckSessionTable(string slug)
    {
        var db = _redis.GetDatabase();
        var session = await db.StringGetAsync($"table:session:{slug}");
        return session.HasValue;
    }
}