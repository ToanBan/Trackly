namespace MyApi.Interfaces;
using MyApi.Models;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
public interface IUserInterface
{
    Task<User> RegisterUserAsync(User user);
    Task<User?> GetUserByIdAsync(int id);

    Task<User?> FindUserByEmailAsync(string email);

}