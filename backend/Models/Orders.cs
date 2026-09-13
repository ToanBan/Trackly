namespace MyApi.Models;

public class Orders
{
    public int Id { get; set; }

    public required int TableId { get; set; }
    public Tables? Table { get; set; }

    // Null = khách vãng lai; có giá trị = khách hàng trung thành
    public int? UserId { get; set; }
    public User? User { get; set; }

    // Đơn gắn vào hóa đơn đang mở của bàn
    public int? BillId { get; set; }
    public Bills? Bill { get; set; }

    // Pending / Preparing / Served / Cancelled
    public required string Status { get; set; } = "Pending";

    // Tổng tiền của CHÍNH đợt gọi này (tạm tính, không chứa discount)
    public decimal Subtotal { get; set; }

    public DateTime CreatedAt { get; set; }

    public List<OrderItems> Items { get; set; } = new();
}