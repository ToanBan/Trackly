using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApi.DTOS;
using MyApi.Services;

namespace MyApi.Controllers;

[ApiController]
[Route("api")]
public class BillsController : ControllerBase
{
    private readonly BillsService _billsService;

    public BillsController(BillsService billsService)
    {
        _billsService = billsService;
    }

    [Authorize]
    [HttpGet("bills")]
    public async Task<IActionResult> GetBills(int page = 1, int limit = 10)
    {
        var bills = await _billsService.GetBillsAsync(page, limit);
        return Ok(new { items = bills.Select(MapBill) });
    }

    [Authorize]
    [HttpGet("bills/{id}")]
    public async Task<IActionResult> GetBill(int id)
    {
        try
        {
            var bill = await _billsService.GetBillByIdAsync(id);
            return Ok(MapBill(bill));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost("bills/{id}/pay")]
    public async Task<IActionResult> PayBill(int id, [FromBody] PayBillDTO dto)
    {
        try
        {
            var userId = GetUserIdIfAuthenticated();
            var bill = await _billsService.PayBillAsync(id, userId, dto);
            return Ok(new
            {
                message = "Thanh toán thành công",
                bill = MapBill(bill),
                pointsEarned = bill.LoyaltyPointsEarned
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private int? GetUserIdIfAuthenticated()
    {
        if (User.Identity?.IsAuthenticated != true)
        {
            return null;
        }

        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub);
        return claim != null && int.TryParse(claim.Value, out var uid) ? uid : (int?)null;
    }

    private static BillResponse MapBill(Models.Bills b)
    {
        return new BillResponse
        {
            Id = b.Id,
            TableId = b.TableId,
            UserId = b.UserId,
            Status = b.Status,
            Subtotal = b.Subtotal,
            DiscountAmount = b.DiscountAmount,
            LoyaltyPointsUsed = b.LoyaltyPointsUsed,
            Total = b.Total,
            LoyaltyPointsEarned = b.LoyaltyPointsEarned,
            CreatedAt = b.CreatedAt,
            PaidAt = b.PaidAt,
            OrderIds = b.Orders.Select(o => o.Id).ToList()
        };
    }
}