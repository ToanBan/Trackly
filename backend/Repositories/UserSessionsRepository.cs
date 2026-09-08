namespace MyApi.Repositories;

using Microsoft.EntityFrameworkCore;
using MyApi.Data;
using MyApi.Helpers;
using MyApi.Interfaces;
using MyApi.Models;
public class UserSessionsRepository : IUserSessionsRepository
{
    private readonly AppDbContext _context;

    public UserSessionsRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<UserSessions> CreateUserSessionAsync(UserSessions userSession)
    {
        _context.UserSessions.Add(userSession);
        await _context.SaveChangesAsync();
        return userSession;
    }

    public async Task<UserSessions?> GetUserSessionByIdAsync(int userId)
    {
        return await _context.UserSessions
            .AsNoTracking()
            .FirstOrDefaultAsync(user => user.UserId == userId);
    }

    public async Task<UserSessions?> GetUserSessionByRefreshTokenAsync(string refreshToken)
    {
        var hashRefreshToken = TokenHasher.Hash(refreshToken);
        return await _context.UserSessions
            .AsNoTracking()
            .FirstOrDefaultAsync(session => session.SessionToken == hashRefreshToken);
    }


    public async Task<UserSessions?> UpdateUserSessionAsync(string refreshToken, string newRefreshToken, int userId)
    {
        var userSession = await _context.UserSessions
            .FirstOrDefaultAsync(session => session.UserId == userId && session.SessionToken == TokenHasher.Hash(refreshToken));

        if (userSession == null)
        {
            return null;
        }

        userSession.SessionToken = TokenHasher.Hash(newRefreshToken);
        await _context.SaveChangesAsync();
        return userSession;
    }


    public async Task<bool> DeleteUserSessionAsync(int id)
    {
        var userSession = await _context.UserSessions.FindAsync(id);
        if (userSession == null)
        {
            return false;
        }

        _context.UserSessions.Remove(userSession);
        await _context.SaveChangesAsync();
        return true;
    }
}