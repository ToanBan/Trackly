namespace MyApi.Interfaces;

using MyApi.Models;
public interface IUserSessionsRepository
{
    Task<UserSessions> CreateUserSessionAsync(UserSessions userSession);
    Task<UserSessions?> GetUserSessionByIdAsync(int id);
    Task<UserSessions?> GetUserSessionByRefreshTokenAsync(string refreshToken);
    Task<bool> DeleteUserSessionAsync(int id);

    Task<UserSessions?> UpdateUserSessionAsync(string refreshToken, string newRefreshToken, int userId);

   
}