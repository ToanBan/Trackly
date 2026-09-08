namespace MyApi.Models;

public class UserSessions
{
    public int Id { get; set; }
    public required string SessionToken { get; set; }

    public string? DeviceInfo { get; set; }
    public required DateTime Expiration { get; set; }
    public required int UserId { get; set; }

    public required DateTime CreatedAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public User? User { get; set; }
}