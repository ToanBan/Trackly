namespace MyApi.Interfaces;

public interface ICacheInterface
{
    Task AddToBlacklistAsync(string jti, TimeSpan ttl);
    Task<bool> IsJtiBlacklistedAsync(string jti);
}   