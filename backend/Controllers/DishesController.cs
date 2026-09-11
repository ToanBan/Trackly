using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApi.DTOS;
using MyApi.Services;

namespace MyApi.Controllers;


[ApiController]
[Route("api/dishes")]
public class DishesController : ControllerBase
{
    private readonly DishesService _dishService;

    public DishesController(DishesService dishService)
    {
        _dishService = dishService;
    }


    [Authorize]
    [HttpPost]
    public async Task<IActionResult>AddDish([FromForm] CreateDish dish)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub);

        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        await _dishService.AddDish(dish, userId);
        return Ok();
    }


    [HttpGet]
    public async Task<IActionResult>GetListDishes(int limit, int page)
    {
        var dishes = await _dishService.GetListDishes(limit, page);
        return Ok(dishes);
    }

    [HttpGet("{Id}")]
    public async Task<IActionResult>GetDishDetail(int Id)
    {
        var dish = await _dishService.GetDishDetail(Id);
        return Ok(dish);
    }


    [HttpDelete("{Id}")]
    public async Task<IActionResult>DeleteDishById(int Id)
    {
        await _dishService.DeleteDishById(Id);
        return Ok();
    }


    [HttpPut("{Id}")]
    public async Task<IActionResult>UpdateDishById(int Id, [FromForm] UpdateDish dish)
    {
        await _dishService.UpdateDishById(Id, dish);
        return Ok();
    }
}