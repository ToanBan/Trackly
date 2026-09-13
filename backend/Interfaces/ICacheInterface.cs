namespace MyApi.Interfaces;

public interface ICacheInterface
{
    Task AddToBlacklistAsync(string jti, TimeSpan ttl);
    Task<bool> IsJtiBlacklistedAsync(string jti);

    Task<bool>CheckSessionTable(string jti);

    Task<T?> GetAsync<T>(string key);
    Task SetAsync<T>(string key, T value, TimeSpan ttl);
    Task RemoveAsync(string key);
    Task RemoveByPrefixAsync(string prefix);
}   