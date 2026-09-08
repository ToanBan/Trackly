using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApi.DTOS;
using MyApi.Exceptions;
using MyApi.Interfaces;
using MyApi.Services;

namespace MyApi.Controllers;

[ApiController]
[Route("api")]
public class UserController : ControllerBase
{
    private readonly UserService _userService;
    private readonly IJwtTokenService _jwtTokenService;

    public UserController(UserService userService, IJwtTokenService jwtTokenService)
    {
        _userService = userService;
        _jwtTokenService = jwtTokenService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(UserRegisterDTO userRegisterDTO)
    {
        try
        {
            var user = await _userService.RegisterUserAsync(userRegisterDTO);
            return Ok(new
            {
                message = "Registered successfully",
                user = new { id = user.Id, username = user.Username, email = user.Email }
            });
        }
        catch (ApiException ex)
        {
            return StatusCode(ex.StatusCode, new { message = ex.Message });
        }
        catch
        {
            return StatusCode(500, new { message = "An error occurred while registering" });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(UserLoginDTO userLoginDTO)
    {
        try
        {
            var user = await _userService.FindUserByEmailAsync(userLoginDTO.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(userLoginDTO.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            var accessToken = _jwtTokenService.GenerateAccessToken(user.Id, user.Email, user.Username);
            var refreshToken = _jwtTokenService.GenerateRefreshToken(user.Id);

            await _userService.CreateUserSessionAsync(refreshToken, user.Id);

            _jwtTokenService.AppendAuthCookies(Response, accessToken, refreshToken);

            return Ok(new { message = "Logged in successfully" });
        }
        catch (ApiException ex)
        {
            return StatusCode(ex.StatusCode, new { message = ex.Message });
        }
        catch
        {
            return StatusCode(500, new { message = "An error occurred while logging in" });
        }
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        try
        {
            var refreshToken = Request.Cookies["refreshToken"];
            var accessToken = Request.Cookies["accessToken"];

            if (string.IsNullOrEmpty(refreshToken) || string.IsNullOrEmpty(accessToken))
            {
                return BadRequest(new { message = "Token is missing" });
            }

            var jti = _jwtTokenService.ReadJtiFromAccessToken(accessToken);
            var remainingTime = _jwtTokenService.GetRemainingLifetime(accessToken);

            await _userService.Logout(refreshToken, remainingTime ?? TimeSpan.Zero, jti ?? string.Empty);

            _jwtTokenService.ClearAuthCookies(Response);

            return Ok(new { message = "Logged out successfully" });
        }
        catch (ApiException ex)
        {
            return StatusCode(ex.StatusCode, new { message = ex.Message });
        }
        catch
        {
            return StatusCode(500, new { message = "An error occurred while logging out" });
        }
    }

   
    [Authorize]
    [HttpGet("users/me")]
    public async Task<IActionResult> Me()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub);

        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        var user = await _userService.GetUserByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        return Ok(new { id = user.Id, username = user.Username, email = user.Email });
    }


    [HttpPost("refresh-token")]
    public async Task<IActionResult>RefreshToken()
    {
        try
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
            {
                return BadRequest(new { message = "Refresh token is missing" });
            }

            var userId = await _userService.ValidateRefreshTokenAsync(refreshToken);
            if (userId == null)
            {
                return Unauthorized(new { message = "Invalid refresh token" });
            }

            var user = await _userService.GetUserByIdAsync(userId.Id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            var newAccessToken = _jwtTokenService.GenerateAccessToken(user.Id, user.Email, user.Username);
            var newRefreshToken = _jwtTokenService.GenerateRefreshToken(user.Id);

            await _userService.UpdateUserSessionAsync(refreshToken, newRefreshToken, user.Id);

            _jwtTokenService.AppendAuthCookies(Response, newAccessToken, newRefreshToken);

            return Ok(new { message = "Tokens refreshed successfully" });
        }
        catch (ApiException ex)
        {
            return StatusCode(ex.StatusCode, new { message = ex.Message });
        }
        catch
        {
            return StatusCode(500, new { message = "An error occurred while refreshing tokens" });
        }
    }
}