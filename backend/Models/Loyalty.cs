namespace MyApi.Models;

public class Loyalty
{
    public int Id { get; set; }

    // 1-1 với User, unique
    public required int UserId { get; set; }
    public User? User { get; set; }

    public int Points { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public List<LoyaltyHistory> History { get; set; } = new();
}