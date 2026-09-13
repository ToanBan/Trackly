using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using MyApi.Interfaces;
using MyApi.Services;

namespace MyApi.Controllers;

[ApiController]
[Route("api")]
public class GoogleAuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly UserService _userService;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IHttpClientFactory _httpClientFactory;

    public GoogleAuthController(
        IConfiguration configuration,
        UserService userService,
        IJwtTokenService jwtTokenService,
        IHttpClientFactory httpClientFactory)
    {
        _configuration = configuration;
        _userService = userService;
        _jwtTokenService = jwtTokenService;
        _httpClientFactory = httpClientFactory;
    }

    private string ClientId => _configuration["Authentication:Google:ClientId"] ?? "";
    private string ClientSecret => _configuration["Authentication:Google:ClientSecret"] ?? "";

    private string RedirectUri =>
        _configuration["Authentication:Google:RedirectUri"] ?? "http://localhost:5289/api/google/callback";

    private string FrontendUrl =>
        _configuration["Authentication:Google:FrontendUrl"] ?? "http://localhost:5173";

    [HttpGet("auth/google")]
    public IActionResult SignInWithGoogle()
    {
        var state = Convert.ToHexString(RandomNumberGenerator.GetBytes(16));

        Response.Cookies.Append("google_oauth_state", state, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTimeOffset.UtcNow.AddMinutes(10)
        });

        var url =
            "https://accounts.google.com/o/oauth2/v2/auth" +
            $"?client_id={Uri.EscapeDataString(ClientId)}" +
            $"&redirect_uri={Uri.EscapeDataString(RedirectUri)}" +
            "&response_type=code" +
            "&scope=openid%20email%20profile" +
            $"&state={Uri.EscapeDataString(state)}" +
            "&prompt=select_account";

        return Redirect(url);
    }

    [HttpGet("google/callback")]
    public async Task<IActionResult> GoogleCallback([FromQuery] string? code, [FromQuery] string? state)
    {
        var expectedState = Request.Cookies["google_oauth_state"];
        Response.Cookies.Delete("google_oauth_state");

        if (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(state) || state != expectedState)
        {
            return Redirect($"{FrontendUrl}/login?googleError=invalid_state");
        }

        try
        {
            var (email, name) = await GetGoogleProfileAsync(code);

            var user = await _userService.FindOrCreateGoogleUserAsync(email, name);

            var accessToken = _jwtTokenService.GenerateAccessToken(user.Id, user.Email, user.Username, user.Roles);
            var refreshToken = _jwtTokenService.GenerateRefreshToken(user.Id);

            await _userService.CreateUserSessionAsync(refreshToken, user.Id);
            _jwtTokenService.AppendAuthCookies(Response, accessToken, refreshToken);

            return Redirect(FrontendUrl);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[GoogleAuth] Login failed: {ex.Message}");
            return Redirect($"{FrontendUrl}/login?googleError=login_failed");
        }
    }

    private async Task<(string Email, string Name)> GetGoogleProfileAsync(string code)
    {
        var client = _httpClientFactory.CreateClient();

        var response = await client.PostAsync("https://oauth2.googleapis.com/token", new FormUrlEncodedContent(
            new Dictionary<string, string>
            {
                ["code"] = code,
                ["client_id"] = ClientId,
                ["client_secret"] = ClientSecret,
                ["redirect_uri"] = RedirectUri,
                ["grant_type"] = "authorization_code"
            }));

        var tokenResponse = await response.Content.ReadFromJsonAsync<JsonElement>();
        if (!response.IsSuccessStatusCode || !tokenResponse.TryGetProperty("id_token", out var idTokenElement))
        {
            var error = tokenResponse.TryGetProperty("error_description", out var desc)
                ? desc.GetString()
                : response.StatusCode.ToString();
            throw new Exception($"Google token exchange failed: {error}");
        }

        var idToken = idTokenElement.GetString()!;
        var parts = idToken.Split('.');
        if (parts.Length != 3)
        {
            throw new Exception("Invalid id_token");
        }

        var payload = parts[1].Replace('-', '+').Replace('_', '/');
        switch (payload.Length % 4)
        {
            case 2: payload += "=="; break;
            case 3: payload += "="; break;
        }

        var claims = JsonSerializer.Deserialize<JsonElement>(Convert.FromBase64String(payload));

        var emailVerified = claims.TryGetProperty("email_verified", out var v) && v.GetBoolean();
        if (!emailVerified)
        {
            throw new Exception("Google account email is not verified");
        }

        var email = claims.GetProperty("email").GetString()
            ?? throw new Exception("Google account has no email");
        var name = claims.TryGetProperty("name", out var n) ? n.GetString() : null;

        return (email.Trim().ToLowerInvariant(), name ?? email.Split('@')[0]);
    }
}
