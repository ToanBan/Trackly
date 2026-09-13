using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApi.Services;

namespace MyApi.Controllers;

[ApiController]
[Route("api")]
public class LoyaltyController : ControllerBase
{
    private readonly LoyaltyService _loyaltyService;

    public LoyaltyController(LoyaltyService loyaltyService)
    {
        _loyaltyService = loyaltyService;
    }

    [Authorize]
    [HttpGet("loyalty/me")]
    public async Task<IActionResult> Me()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub);
        if (claim == null || !int.TryParse(claim.Value, out var userId))
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        var loyalty = await _loyaltyService.GetLoyaltyByUserIdAsync(userId);

        if (loyalty == null)
        {
            return Ok(new { points = 0, history = Array.Empty<object>() });
        }

        return Ok(new
        {
            points = loyalty.Points,
            history = loyalty.History.OrderByDescending(h => h.CreatedAt).Select(h => new
            {
                id = h.Id,
                type = h.Type,
                points = h.Points,
                description = h.Description,
                billId = h.BillId,
                createdAt = h.CreatedAt
            })
        });
    }
}