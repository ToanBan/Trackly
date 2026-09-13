namespace MyApi.Interfaces;

using MyApi.Models;

public interface ILoyaltyRepository
{
    public Task<Loyalty?> GetByUserIdAsync(int userId);
    public Task<Loyalty> AddLoyaltyAsync(Loyalty loyalty);
    public Task<Loyalty?> UpdateLoyaltyAsync(Loyalty loyalty);
    public Task AddHistoryAsync(LoyaltyHistory history);
    public Task<List<LoyaltyHistory>> GetHistoryByLoyaltyIdAsync(int loyaltyId);
}