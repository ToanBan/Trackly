namespace MyApi.Services;

using Microsoft.EntityFrameworkCore;
using MyApi.Data;
using MyApi.DTOS;
using MyApi.Events;
using MyApi.Interfaces;
using MyApi.Models;

public class OrdersService
{
    private readonly IOrderRepository _orderRepository;
    private readonly IBillRepository _billRepository;
    private readonly ITablesRepository _tablesRepository;
    private readonly IRabbitMqPublisher _rabbitPublisher;
    private readonly ILogger<OrdersService> _logger;
    private readonly AppDbContext _context;

    public OrdersService(
        IOrderRepository orderRepository,
        IBillRepository billRepository,
        ITablesRepository tablesRepository,
        IRabbitMqPublisher rabbitPublisher,
        ILogger<OrdersService> logger,
        AppDbContext context)
    {
        _orderRepository = orderRepository;
        _billRepository = billRepository;
        _tablesRepository = tablesRepository;
        _rabbitPublisher = rabbitPublisher;
        _logger = logger;
        _context = context;
    }

    public async Task<Orders> CreateOrderAsync(string tableSlug, int? userId, CreateOrderDTO dto)
    {
        if (dto.Items == null || dto.Items.Count == 0)
        {
            throw new Exception("Giỏ hàng trống. Không thể tạo đơn hàng.");
        }

        var table = await _tablesRepository.GetTableBySlugAsync(tableSlug);

        await using var transaction = await _context.Database.BeginTransactionAsync();

        var bill = await _billRepository.GetOpenBillForUpdateAsync(table.Id);
        if (bill == null)
        {
            bill = new Bills
            {
                TableId = table.Id,
                Status = "Open",
                Subtotal = 0,
                DiscountAmount = 0,
                Total = 0,
                CreatedAt = DateTime.UtcNow
            };
            await _billRepository.AddBillAsync(bill);
        }

        var now = DateTime.UtcNow;
        var order = new Orders
        {
            TableId = table.Id,
            UserId = userId,
            BillId = bill.Id,
            Status = "Pending",
            CreatedAt = now
        };

        decimal subtotal = 0;
        foreach (var item in dto.Items)
        {
            if (item.Quantity <= 0)
            {
                throw new Exception("Số lượng món phải lớn hơn 0.");
            }

            var dish = await _context.dishes.FindAsync(item.DishId);
            if (dish == null)
            {
                throw new Exception($"Không tìm thấy món với Id = {item.DishId}");
            }
            if (!dish.IsAvailable)
            {
                throw new Exception($"Món \"{dish.Name}\" hiện tạm hết.");
            }

            var lineTotal = dish.Price * item.Quantity;
            subtotal += lineTotal;

            order.Items.Add(new OrderItems
            {
                DishId = dish.Id,
                DishName = dish.Name,
                UnitPrice = dish.Price,
                Quantity = item.Quantity,
                LineTotal = lineTotal
            });
        }

        order.Subtotal = subtotal;
        await _orderRepository.AddOrderAsync(order);

        bill.Subtotal += subtotal;
        bill.Total = bill.Subtotal;
        await _billRepository.UpdateBillAsync(bill);
        await transaction.CommitAsync();

        try
        {
            _rabbitPublisher.PublishOrderCreated(new OrderCreatedEvent(
                OrderId: order.Id,
                TableId: order.TableId,
                UserId: order.UserId,
                BillId: order.BillId,
                Status: order.Status,
                Subtotal: order.Subtotal,
                CreatedAt: order.CreatedAt,
                Items: order.Items.Select(i => new OrderCreatedItem(
                    DishId: i.DishId,
                    DishName: i.DishName,
                    UnitPrice: i.UnitPrice,
                    Quantity: i.Quantity,
                    LineTotal: i.LineTotal)).ToList()));
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex,
                "Publish OrderCreated failed for order {OrderId}. Kitchen view will catch up via polling.",
                order.Id);
        }

        return order;
    }

    public async Task<List<Orders>> GetOrdersAsync(int page = 1, int limit = 10)
    {
        if (page < 1) page = 1;
        if (limit < 1) limit = 10;
        return await _orderRepository.GetOrdersAsync((page - 1) * limit, limit);
    }

    public async Task<int> GetOrdersTotalAsync()
    {
        return await _orderRepository.GetOrdersTotalAsync();
    }

    public async Task<Orders> GetOrderByIdAsync(int id)
    {
        var order = await _orderRepository.GetOrderByIdAsync(id);
        if (order == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy đơn hàng với Id = {id}");
        }
        return order;
    }

    public async Task<Orders> UpdateOrderStatusAsync(int id, string status)
    {
        return await _orderRepository.UpdateOrderStatusAsync(id, status);
    }
}