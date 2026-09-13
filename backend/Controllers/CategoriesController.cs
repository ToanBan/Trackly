using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using MyApi.Services;
using MyApi.Middleware;

namespace MyApi.Controllers;

using MyApi.DTOS;

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly CategoriesService _categoriesService;

    public CategoriesController(CategoriesService categoriesService)
    {
        _categoriesService = categoriesService;
    }

    [Authorize]
    [Roles("admin")]
    [HttpPost]
    public async Task<IActionResult> CreateDish([FromForm] CreateCategory category)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)
            ?? User.FindFirst(JwtRegisteredClaimNames.Sub);

        Console.WriteLine($"{userIdClaim} hdkakjshdjashdjkas");

        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
        {
            return Unauthorized(new { message = "Invalid token" });
        }

        await _categoriesService.CreateCategory(category, userId);

        return Ok();
    }


    [HttpGet]
    public async Task<IActionResult> GetListCategory(int limit, int page)
    {
        var categories = await _categoriesService.GetListCategories(limit, page);
        return Ok(categories);
    }

    [HttpGet("{Id}")]
    public async Task<IActionResult>GetCategoryDetail(int Id)
    {
        var category = await _categoriesService.GetCategoryById(Id);
        return Ok(category);
    }


    [Roles("admin")]
    [HttpDelete("{Id}")]
    public async Task<IActionResult>DeleteCategoryById(int Id)
    {
        await _categoriesService.DeleteCategoryById(Id);
        return Ok();
    }

    [Roles("admin")]
    [HttpPut("{Id}")]
    public async Task<IActionResult>UpdateCategoryById(int Id, [FromBody] UpdateCategory category)
    {
        await _categoriesService.UpdateCategoryById(Id, category);
        return Ok();
    }

}