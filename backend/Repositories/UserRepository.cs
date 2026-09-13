namespace MyApi.Repositories;

using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using MyApi.Data;
using MyApi.DTOS;
using MyApi.Interfaces;
using MyApi.Models;
public class UserRepository : IUserInterface
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User> RegisterUserAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<User?> GetUserByIdAsync(int id)
    {
        return await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<User?> FindUserByEmailAsync(string email)
    {
        return await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<List<User>> GetUsersByRoleAsync(string role, int offset, int limit)
    {
        return await _context.Users
            .AsNoTracking()
            .Where(u => u.Roles.Contains(role))
            .OrderBy(u => u.Id)
            .Skip(offset)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<int> CountUsersByRoleAsync(string role)
    {
        return await _context.Users
            .AsNoTracking()
            .CountAsync(u => u.Roles.Contains(role));
    }

    public async Task<List<CustomerLoyalty>> GetCustomersWithPointsAsync(int offset, int limit)
    {
        return await _context.Users
            .AsNoTracking()
            .Where(u => u.Roles.Contains("user"))
            .GroupJoin(
                _context.Loyalties,
                u => u.Id,
                l => l.UserId,
                (u, ls) => new { u, ls })
            .SelectMany(
                x => x.ls.DefaultIfEmpty(),
                (x, l) => new CustomerLoyalty
                {
                    Id = x.u.Id,
                    Username = x.u.Username,
                    Email = x.u.Email,
                    PhoneNumber = x.u.PhoneNumber,
                    Points = l != null ? l.Points : 0,
                })
            .OrderByDescending(c => c.Points)
            .ThenBy(c => c.Id)
            .Skip(offset)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<User?> UpdateUserRolesAsync(int id, List<string> roles)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return null;
        }
        user.Roles = roles;
        await _context.SaveChangesAsync();
        return user;
    }

    // Đăng nhập Google: tìm theo email, chưa có thì tạo user mới.
    // PasswordHash là chuỗi ngẫu nhiên -> user không thể (và không cần) đăng nhập bằng mật khẩu.
    public async Task<User> FindOrCreateGoogleUserAsync(string email, string name)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user != null)
        {
            return user;
        }

        var randomPassword = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        user = new User
        {
            Username = string.IsNullOrWhiteSpace(name) ? email.Split('@')[0] : name.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(randomPassword),
            Roles = new List<string> { "user" }
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }
}