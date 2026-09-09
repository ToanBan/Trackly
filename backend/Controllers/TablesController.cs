using Microsoft.AspNetCore.Mvc;
namespace MyApi.Controllers;

using MyApi.Services;
using MyApi.Models;
using MyApi.Interfaces;

[ApiController]
[Route("api")]
public class TablesController : ControllerBase
{
    private readonly TablesService _tablesService;
    private readonly IJwtTokenService _jwtTokenService;


    public TablesController(TablesService tablesService, IJwtTokenService jwtTokenService)
    {
        _tablesService = tablesService;
        _jwtTokenService = jwtTokenService;
    }


    [HttpPost("table/generate-qr")]
    public async Task<IActionResult> CreateTable(string tableNumber)
    {
        if (string.IsNullOrEmpty(tableNumber))
        {
            return BadRequest(new
            {
                message = "Table number is required"
            });
        }

        var table = await _tablesService.AddTableAsync(tableNumber);

        return Ok(table);
    }

    [HttpGet("table/{Id}")]
    public async Task<IActionResult> GetTableDetail(int Id)
    {
        var table = await _tablesService.GetTableByIdAsync(Id);
        return Ok(table);
    }
  


    [HttpDelete("table/{Id}")]
    public async Task<IActionResult>DeleteTable(int Id)
    {
        await _tablesService.DeleteTableByIdAsync(Id);
        return Ok();
        
    }

    [HttpGet("table")]
    public async Task<IActionResult> GetTables(int page = 1, int limit = 10)
    {
        var tables = await _tablesService.GetTablesAsync(page, limit);
        return Ok(tables);
    }

    [HttpGet("table/{slug}/table-session/me")]
    public async Task<IActionResult> GetCurrentSession(string slug)
    {
        if (string.IsNullOrEmpty(slug))
        {
            return BadRequest(new { message = "Table slug is required" });
        }

        string? tableToken = await _tablesService.GetCurrentSessionTableAsync(slug);

        if (tableToken == null)
        {
            return NotFound(new { message = $"Table with slug '{slug}' not found" });
        }

        _jwtTokenService.AppendTableCookie(Response, tableToken);

        return Ok(new { tableToken });
    }




}