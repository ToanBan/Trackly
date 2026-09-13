namespace MyApi.DTOS;

// Projection response cho đơn hàng — tránh vòng lặp navigation khi serialize.
public class OrderItemResponse
{
    public int Id { get; set; }
    public int DishId { get; set; }
    public string DishName { get; set; } = "";
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal LineTotal { get; set; }
}

public class OrderResponse
{
    public int Id { get; set; }
    public int TableId { get; set; }
    public int? UserId { get; set; }
    public int? BillId { get; set; }
    public string Status { get; set; } = "";
    public decimal Subtotal { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<OrderItemResponse> Items { get; set; } = new();
}