namespace MyApi.Interfaces;

public interface IJwtTokenService
{
    string GenerateAccessToken(int userId, string email, string username);
    string GenerateRefreshToken(int userId);
    string? ReadJtiFromAccessToken(string accessToken);
    TimeSpan? GetRemainingLifetime(string accessToken);
    void AppendAuthCookies(HttpResponse response, string accessToken, string refreshToken);
    void ClearAuthCookies(HttpResponse response);
}