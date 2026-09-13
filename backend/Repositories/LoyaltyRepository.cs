namespace MyApi.Repositories;

using Microsoft.EntityFrameworkCore;
using MyApi.Data;
using MyApi.Interfaces;
using MyApi.Models;

public class LoyaltyRepository : ILoyaltyRepository
{
    private readonly AppDbContext _context;

    public LoyaltyRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Loyalty?> GetByUserIdAsync(int userId)
    {
        return await _context.Loyalties
            .Include(l => l.History)
            .FirstOrDefaultAsync(l => l.UserId == userId);
    }

    public async Task<Loyalty> AddLoyaltyAsync(Loyalty loyalty)
    {
        _context.Loyalties.Add(loyalty);
        await _context.SaveChangesAsync();
        return loyalty;
    }

    public async Task<Loyalty?> UpdateLoyaltyAsync(Loyalty loyalty)
    {
        var existing = await _context.Loyalties.FindAsync(loyalty.Id);
        if (existing == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy ví điểm cho UserId = {loyalty.UserId}");
        }

        existing.Points = loyalty.Points;
        existing.UpdatedAt = loyalty.UpdatedAt;
        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task AddHistoryAsync(LoyaltyHistory history)
    {
        _context.LoyaltyHistories.Add(history);
        await _context.SaveChangesAsync();
    }

    public async Task<List<LoyaltyHistory>> GetHistoryByLoyaltyIdAsync(int loyaltyId)
    {
        return await _context.LoyaltyHistories
            .Where(h => h.LoyaltyId == loyaltyId)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();
    }
}