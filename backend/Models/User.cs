namespace MyApi.Models;

public class User
{
    public int Id { get; set; }
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }

    public string? Address { get; set; }
    
    public string? PhoneNumber { get; set; }

    public List<string> Roles { get; set; } = new() {"user"};
}