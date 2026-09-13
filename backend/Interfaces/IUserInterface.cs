namespace MyApi.Interfaces;
using MyApi.DTOS;
using MyApi.Models;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
public interface IUserInterface
{
    Task<User> RegisterUserAsync(User user);
    Task<User?> GetUserByIdAsync(int id);

    Task<User?> FindUserByEmailAsync(string email);

    // Lọc user theo role (Roles là jsonb List<string>) — phân trang offset/limit.
    Task<List<User>> GetUsersByRoleAsync(string role, int offset, int limit);

    // Đếm user theo role (cho phân trang).
    Task<int> CountUsersByRoleAsync(string role);

    // Khách hàng thân thiện: role "user" + điểm Loyalty, sắp điểm giảm dần.
    Task<List<CustomerLoyalty>> GetCustomersWithPointsAsync(int offset, int limit);

    // Thay toàn bộ mảng roles của user.
    Task<User?> UpdateUserRolesAsync(int id, List<string> roles);

    // Đăng nhập Google: tìm user theo email, chưa có thì tạo mới (password ngẫu nhiên, role "user").
    Task<User> FindOrCreateGoogleUserAsync(string email, string name);
}