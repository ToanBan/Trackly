namespace MyApi.Interfaces;

public interface IJwtTokenService
{
    string GenerateAccessToken(int userId, string email, string username);
    string GenerateRefreshToken(int userId);

    string GenerateTableToken(string slug);
    void AppendTableCookie(HttpResponse response, string tableToken);

    void ClearTableCookie(HttpResponse response);
    string? ReadJtiFromAccessToken(string accessToken);
    TimeSpan? GetRemainingLifetime(string accessToken);
    void AppendAuthCookies(HttpResponse response, string accessToken, string refreshToken);
    void ClearAuthCookies(HttpResponse response);
}