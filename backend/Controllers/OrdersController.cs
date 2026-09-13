using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApi.DTOS;
using MyApi.Services;

namespace MyApi.Controllers;

[ApiController]
[Route("api")]
public class OrdersController : ControllerBase
{
    private readonly OrdersService _ordersService;

    public OrdersController(OrdersService ordersService)
    {
        _ordersService = ordersService;
    }


    [HttpPost("orders")]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDTO dto)
    {
        try
        {
            var tableSlug = GetTableSlugFromCookie();
            if (string.IsNullOrEmpty(tableSlug))
            {
                return BadRequest(new { message = "Vui lòng quét mã QR bàn để đặt món." });
            }

            var userId = GetUserIdIfAuthenticated();
            var order = await _ordersService.CreateOrderAsync(tableSlug, userId, dto);

            return Ok(new
            {
                message = "Đặt món thành công",
                order = MapOrder(order)
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders(int page = 1, int limit = 10)
    {
        var orders = await _ordersService.GetOrdersAsync(page, limit);
        return Ok(new { items = orders.Select(MapOrder) });
    }

    [Authorize]
    [HttpGet("orders/{id}")]
    public async Task<IActionResult> GetOrder(int id)
    {
        try
        {
            var order = await _ordersService.GetOrderByIdAsync(id);
            return Ok(MapOrder(order));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpPut("orders/{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDTO dto)
    {
        try
        {
            var order = await _ordersService.UpdateOrderStatusAsync(id, dto.Status);
            return Ok(MapOrder(order));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    private string? GetTableSlugFromCookie()
    {
        var tableToken = Request.Cookies["tableToken"];
        if (string.IsNullOrEmpty(tableToken))
        {
            return null;
        }

        try
        {
            var token = new JwtSecurityTokenHandler().ReadJwtToken(tableToken);
            return token.Subject;
        }
        catch
        {
            return null;
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

    private static OrderResponse MapOrder(Models.Orders o)
    {
        return new OrderResponse
        {
            Id = o.Id,
            TableId = o.TableId,
            UserId = o.UserId,
            BillId = o.BillId,
            Status = o.Status,
            Subtotal = o.Subtotal,
            CreatedAt = o.CreatedAt,
            Items = o.Items.Select(i => new OrderItemResponse
            {
                Id = i.Id,
                DishId = i.DishId,
                DishName = i.DishName,
                UnitPrice = i.UnitPrice,
                Quantity = i.Quantity,
                LineTotal = i.LineTotal
            }).ToList()
        };
    }
}

public class UpdateOrderStatusDTO
{
    public required string Status { get; set; }
}