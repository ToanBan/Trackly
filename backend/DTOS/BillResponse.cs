namespace MyApi.DTOS;

public class BillResponse
{
    public int Id { get; set; }
    public int TableId { get; set; }
    public int? UserId { get; set; }
    public string Status { get; set; } = "";
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; }
    public int LoyaltyPointsUsed { get; set; }
    public decimal Total { get; set; }
    public int LoyaltyPointsEarned { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public List<OrderResponse> Orders { get; set; } = new();
}