namespace MyApi.Models;

public class OrderItems
{
    public int Id { get; set; }

    public int OrderId { get; set; }
    public Orders? Order { get; set; }

    public required int DishId { get; set; }
    public Dishes? Dish { get; set; }

    // Snapshot để đơn cũ không bị ảnh hưởng khi món đổi tên/đổi giá
    public required string DishName { get; set; }
    public required decimal UnitPrice { get; set; }

    public required int Quantity { get; set; }
    public required decimal LineTotal { get; set; } // UnitPrice * Quantity
}