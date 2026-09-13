namespace MyApi.Models;

public class LoyaltyHistory
{
    public int Id { get; set; }

    public required int LoyaltyId { get; set; }
    public Loyalty? Loyalty { get; set; }

    // "earn" (+100 khi thanh toán bill) | "redeem" (-400 khi đổi giảm giá)
    public required string Type { get; set; }

    public required int Points { get; set; }   // số dương hoặc âm

    public int? BillId { get; set; }           // bill/đơn liên quan
    public Bills? Bill { get; set; }

    public required string Description { get; set; }
    public DateTime CreatedAt { get; set; }
}