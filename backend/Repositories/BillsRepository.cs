namespace MyApi.Repositories;

using Microsoft.EntityFrameworkCore;
using MyApi.Data;
using MyApi.Interfaces;
using MyApi.Models;

public class BillsRepository : IBillRepository
{
    private readonly AppDbContext _context;

    public BillsRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Bills> AddBillAsync(Bills bill)
    {
        _context.Bills.Add(bill);
        await _context.SaveChangesAsync();
        return bill;
    }

    public async Task<Bills?> GetBillByTableOpenAsync(int tableId)
    {
        return await _context.Bills
            .Where(b => b.TableId == tableId && b.Status == "Open")
            .FirstOrDefaultAsync();
    }

    public async Task<Bills?> GetOpenBillForUpdateAsync(int tableId)
    {
        return await _context.Bills
            .FromSqlInterpolated(
                $"SELECT * FROM \"Bills\" WHERE \"TableId\" = {tableId} AND \"Status\" = 'Open' LIMIT 1 FOR UPDATE")
            .FirstOrDefaultAsync();
    }

    public async Task<Bills?> GetBillByIdAsync(int id)
    {
        return await _context.Bills
            .Include(b => b.Orders)
            .ThenInclude(o => o.Items)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<Bills?> UpdateBillAsync(Bills bill)
    {
        var existing = await _context.Bills.FindAsync(bill.Id);
        if (existing == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy hóa đơn với Id = {bill.Id}");
        }

        existing.Status = bill.Status;
        existing.Subtotal = bill.Subtotal;
        existing.DiscountAmount = bill.DiscountAmount;
        existing.LoyaltyPointsUsed = bill.LoyaltyPointsUsed;
        existing.LoyaltyPointsEarned = bill.LoyaltyPointsEarned;
        existing.UserId = bill.UserId;
        existing.Total = bill.Total;
        existing.PaidAt = bill.PaidAt;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<List<Bills>> GetBillsAsync(int offset, int limit)
    {
        return await _context.Bills
            .Include(b => b.Orders)
            .ThenInclude(o => o.Items)
            .OrderByDescending(b => b.Id)
            .Skip(offset)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<int> GetBillsTotalAsync()
    {
        return await _context.Bills.CountAsync();
    }
}