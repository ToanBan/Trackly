namespace MyApi.Services;

using MyApi.DTOS;
using MyApi.Exceptions;
using MyApi.Helpers;
using MyApi.Interfaces;
using MyApi.Models;

public class UserService
{
    private readonly IUserInterface _userRepository;
    private readonly IUserSessionsRepository _userSessionsRepository;
    private readonly ICacheInterface _cacheService;

    public UserService(IUserInterface userRepository, IUserSessionsRepository userSessionsRepository, ICacheInterface cacheService)
    {
        _userRepository = userRepository;
        _userSessionsRepository = userSessionsRepository;
        _cacheService = cacheService;
    }

    public async Task<User> RegisterUserAsync(UserRegisterDTO userRegisterDTO)
    {
        if (userRegisterDTO.Password != userRegisterDTO.ConfirmPassword)
        {
            throw new ApiException(StatusCodes.Status400BadRequest, "Passwords do not match");
        }

        var normalizedEmail = userRegisterDTO.Email.Trim().ToLowerInvariant();

        var existed = await _userRepository.FindUserByEmailAsync(normalizedEmail);
        if (existed != null)
        {
            throw new ApiException(StatusCodes.Status409Conflict, "Email already exists");
        }

        var user = new User
        {
            Username = userRegisterDTO.Username.Trim(),
            Email = normalizedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(userRegisterDTO.Password)
        };

        return await _userRepository.RegisterUserAsync(user);
    }

    public async Task<User?> GetUserByIdAsync(int id)
    {
        return await _userRepository.GetUserByIdAsync(id);
    }

    public async Task<User?> FindUserByEmailAsync(string email)
    {
        return await _userRepository.FindUserByEmailAsync(email);
    }

    public async Task<UserSessions> CreateUserSessionAsync(string refreshToken, int userId)
    {
        var userSession = new UserSessions
        {
            SessionToken = TokenHasher.Hash(refreshToken),
            Expiration = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow,
            UserId = userId
        };

        return await _userSessionsRepository.CreateUserSessionAsync(userSession);
    }

    public async Task<UserSessions?> Logout(string refreshToken, TimeSpan expiration, string jti)
    {
        var existed = await _userSessionsRepository.GetUserSessionByRefreshTokenAsync(refreshToken);
        if (existed == null)
        {
            throw new ApiException(StatusCodes.Status404NotFound, "Session not found");
        }

        var isDeleted = await _userSessionsRepository.DeleteUserSessionAsync(existed.Id);

        if (!isDeleted)
        {
            throw new ApiException(StatusCodes.Status500InternalServerError, "Failed to delete user session");
        }

        if (expiration > TimeSpan.Zero && !string.IsNullOrEmpty(jti))
        {
            await _cacheService.AddToBlacklistAsync(jti, expiration);
        }

        return existed;
    }


    public async Task<UserSessions>ValidateRefreshTokenAsync(string refreshToken)
    {

        var userSession = await _userSessionsRepository.GetUserSessionByRefreshTokenAsync(refreshToken);

        if (userSession == null || userSession.Expiration < DateTime.UtcNow)
        {
            throw new ApiException(StatusCodes.Status401Unauthorized, "Invalid or expired refresh token");
        }

        return userSession;
    }

    public async Task<UserSessions?> UpdateUserSessionAsync(string refreshToken, string newRefreshToken, int userId)
    {
        return await _userSessionsRepository.UpdateUserSessionAsync(refreshToken, newRefreshToken, userId);
    }

    
}