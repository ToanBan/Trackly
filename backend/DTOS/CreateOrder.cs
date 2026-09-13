namespace MyApi.DTOS;

public class CreateOrderItemDTO
{
    public required int DishId { get; set; }
    public required int Quantity { get; set; }
}

public class CreateOrderDTO
{
    public required List<CreateOrderItemDTO> Items { get; set; }
    public bool UseLoyaltyPoints { get; set; } = false;
}

public class PayBillDTO
{
    // Nếu true: khách (có đăng nhập) chọn dùng 400 điểm để giảm 10% hóa đơn.
    public bool UseLoyaltyPoints { get; set; } = false;
}