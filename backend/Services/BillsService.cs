namespace MyApi.Services;

using MyApi.Data;
using MyApi.DTOS;
using MyApi.Interfaces;
using MyApi.Models;

public class BillsService
{
    private readonly IBillRepository _billRepository;
    private readonly ILoyaltyRepository _loyaltyRepository;
    private readonly ITablesRepository _tablesRepository;
    private readonly AppDbContext _context;

    public BillsService(
        IBillRepository billRepository,
        ILoyaltyRepository loyaltyRepository,
        ITablesRepository tablesRepository,
        AppDbContext context)
    {
        _billRepository = billRepository;
        _loyaltyRepository = loyaltyRepository;
        _tablesRepository = tablesRepository;
        _context = context;
    }

    public async Task<Bills> GetBillByIdAsync(int id)
    {
        var bill = await _billRepository.GetBillByIdAsync(id);
        if (bill == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy hóa đơn với Id = {id}");
        }
        return bill;
    }

    public async Task<List<Bills>> GetBillsAsync(int page = 1, int limit = 10)
    {
        if (page < 1) page = 1;
        if (limit < 1) limit = 10;
        return await _billRepository.GetBillsAsync((page - 1) * limit, limit);
    }

 
    public async Task<Bills> PayBillAsync(int billId, int? userId, PayBillDTO dto)
    {
        var bill = await _billRepository.GetBillByIdAsync(billId);
        if (bill == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy hóa đơn với Id = {billId}");
        }
        if (bill.Status != "Open")
        {
            throw new Exception($"Hóa đơn đã ở trạng thái {bill.Status}, không thể thanh toán lại.");
        }

        await using var transaction = await _context.Database.BeginTransactionAsync();

        decimal subtotal = 0;
        foreach (var order in bill.Orders)
        {
            subtotal += order.Subtotal;
        }

        decimal discountAmount = 0;
        int pointsUsed = 0;
        Loyalty? loyalty = null;

        if (userId.HasValue)
        {
            loyalty = await _loyaltyRepository.GetByUserIdAsync(userId.Value);

            if (dto.UseLoyaltyPoints)
            {
                if (loyalty == null || loyalty.Points < LoyaltyRules.RedeemThreshold)
                {
                    throw new Exception("Không đủ 400 điểm để sử dụng ưu đãi giảm giá.");
                }

                pointsUsed = LoyaltyRules.RedeemPoints;
                discountAmount = Math.Round(subtotal * LoyaltyRules.DiscountPercent / 100m, 2);
            }

            int newPoints = (loyalty?.Points ?? 0) - pointsUsed + LoyaltyRules.PointsPerOrder;

            if (loyalty == null)
            {
                loyalty = new Loyalty
                {
                    UserId = userId.Value,
                    Points = newPoints,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                await _loyaltyRepository.AddLoyaltyAsync(loyalty);
            }
            else
            {
                loyalty.Points = newPoints;
                loyalty.UpdatedAt = DateTime.UtcNow;
                await _loyaltyRepository.UpdateLoyaltyAsync(loyalty);
            }

            if (pointsUsed > 0)
            {
                await _loyaltyRepository.AddHistoryAsync(new LoyaltyHistory
                {
                    LoyaltyId = loyalty.Id,
                    Type = "redeem",
                    Points = -pointsUsed,
                    BillId = billId,
                    Description = $"Đổi {pointsUsed} điểm giảm {LoyaltyRules.DiscountPercent}% hóa đơn #{billId}",
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _loyaltyRepository.AddHistoryAsync(new LoyaltyHistory
            {
                LoyaltyId = loyalty.Id,
                Type = "earn",
                Points = LoyaltyRules.PointsPerOrder,
                BillId = billId,
                Description = $"Tích {LoyaltyRules.PointsPerOrder} điểm hóa đơn #{billId}",
                CreatedAt = DateTime.UtcNow
            });
        }

        bill.Subtotal = subtotal;
        bill.DiscountAmount = discountAmount;
        bill.LoyaltyPointsUsed = pointsUsed;
        bill.UserId = userId ?? bill.UserId;
        bill.Total = subtotal - discountAmount;
        bill.LoyaltyPointsEarned = userId.HasValue ? LoyaltyRules.PointsPerOrder : 0;
        bill.Status = "Paid";
        bill.PaidAt = DateTime.UtcNow;

        await _billRepository.UpdateBillAsync(bill);
        await transaction.CommitAsync();

        // Thanh toán xong -> bàn trống cho khách tiếp theo.
        // Chạy SAU commit (bill chắc chắn đã Paid); lỗi chỉ log vì bill đã chốt,
        // lần pay tiếp theo trên bill này đã bị chặn — không có gì để "sửa".
        try
        {
            await _tablesRepository.UpdateTableStatusAsync(bill.TableId, "available");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[BillsService] Update table status to available failed: {ex.Message}");
        }

        return bill;
    }
}