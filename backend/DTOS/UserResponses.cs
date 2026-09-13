namespace MyApi.DTOS;

// Summary user — KHÔNG bao giờ trả PasswordHash ra ngoài.
public class UserSummary
{
    public int Id { get; set; }
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
    public string? PhoneNumber { get; set; }
    public List<string> Roles { get; set; } = new();
}

// Khách hàng thân thiện: user role "user" + điểm từ Loyalty (0 nếu chưa có).
public class CustomerLoyalty
{
    public int Id { get; set; }
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
    public string? PhoneNumber { get; set; }
    public int Points { get; set; }
}

public class UpdateUserRolesDTO
{
    public required List<string> Roles { get; set; }
}