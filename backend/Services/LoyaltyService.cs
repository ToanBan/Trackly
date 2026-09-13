namespace MyApi.Services;

using MyApi.Interfaces;
using MyApi.Models;

public class LoyaltyService
{
    private readonly ILoyaltyRepository _loyaltyRepository;

    public LoyaltyService(ILoyaltyRepository loyaltyRepository)
    {
        _loyaltyRepository = loyaltyRepository;
    }

    public async Task<Loyalty?> GetLoyaltyByUserIdAsync(int userId)
    {
        return await _loyaltyRepository.GetByUserIdAsync(userId);
    }
}