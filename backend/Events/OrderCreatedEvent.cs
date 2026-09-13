namespace MyApi.Events;

public record OrderCreatedItem(
    int DishId,
    string DishName,
    decimal UnitPrice,
    int Quantity,
    decimal LineTotal);

public record OrderCreatedEvent(
    int OrderId,
    int TableId,
    int? UserId,
    int? BillId,
    string Status,
    decimal Subtotal,
    DateTime CreatedAt,
    List<OrderCreatedItem> Items);