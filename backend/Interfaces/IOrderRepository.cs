namespace MyApi.Interfaces;

using MyApi.Models;

public interface IOrderRepository
{
    public Task<Orders> AddOrderAsync(Orders order);
    public Task<Orders?> GetOrderByIdAsync(int id);
    public Task<List<Orders>> GetOrdersAsync(int offset, int limit);
    public Task<int> GetOrdersTotalAsync();
    public Task<List<Orders>> GetOrdersByBillIdAsync(int billId);
    public Task<Orders?> UpdateOrderStatusAsync(int id, string status);
}