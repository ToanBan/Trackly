namespace MyApi.Repositories;

using Microsoft.EntityFrameworkCore;
using MyApi.Data;
using MyApi.Interfaces;
using MyApi.Models;

public class OrdersRepository : IOrderRepository
{
    private readonly AppDbContext _context;

    public OrdersRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Orders> AddOrderAsync(Orders order)
    {
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();
        return order;
    }

    public async Task<Orders?> GetOrderByIdAsync(int id)
    {
        return await _context.Orders
            .Include(o => o.Items)
            .ThenInclude(i => i.Dish)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<List<Orders>> GetOrdersAsync(int offset, int limit)
    {
        return await _context.Orders
            .Include(o => o.Items)
            .OrderByDescending(o => o.Id)
            .Skip(offset)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<int> GetOrdersTotalAsync()
    {
        return await _context.Orders.CountAsync();
    }

    public async Task<List<Orders>> GetOrdersByBillIdAsync(int billId)
    {
        return await _context.Orders
            .Include(o => o.Items)
            .Where(o => o.BillId == billId)
            .OrderBy(o => o.Id)
            .ToListAsync();
    }

    public async Task<Orders?> UpdateOrderStatusAsync(int id, string status)
    {
        var existing = await _context.Orders.FindAsync(id);
        if (existing == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy đơn hàng với Id = {id}");
        }

        existing.Status = status;
        await _context.SaveChangesAsync();
        return existing;
    }
}