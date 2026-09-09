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
        var db = _redis.GetDatabase();
        var isBlacklisted = await db.StringGetAsync($"bl:jti:{jti}");
        return isBlacklisted.HasValue && isBlacklisted == "true";
    }

    public async Task<bool> CheckSessionTable(string slug)
    {
        var db = _redis.GetDatabase();
        var session = await db.StringGetAsync($"table:session:{slug}");
        return session.HasValue;
    }
}