namespace MyApi.Models;

public class Bills
{
    public int Id { get; set; }

    public required int TableId { get; set; }
    public Tables? Table { get; set; }

    // Khách trung thành gắn lúc thanh toán (nullable — guest không có)
    public int? UserId { get; set; }
    public User? User { get; set; }

    // Open / Paid / Cancelled
    public required string Status { get; set; } = "Open";

    public decimal Subtotal { get; set; }         // cộng từ tất cả Orders trong bill
    public decimal DiscountAmount { get; set; }   // giảm 10% khi dùng điểm
    public int LoyaltyPointsUsed { get; set; }    // 400 điểm đã tiêu
    public decimal Total { get; set; }            // Subtotal - DiscountAmount

    public int LoyaltyPointsEarned { get; set; }  // +100 điểm sau khi thanh toán

    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }

    public List<Orders> Orders { get; set; } = new();
}