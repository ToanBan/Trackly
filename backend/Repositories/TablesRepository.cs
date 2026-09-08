namespace MyApi.Repositories;
using MyApi.Interfaces;
using MyApi.Data;
using MyApi.Models;
using Microsoft.EntityFrameworkCore;

public class TablesRepository : ITablesRepository
{
    private readonly AppDbContext _context;

    public TablesRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Tables> AddTableAsync(Tables table)
    {
        _context.Tables.Add(table);
        await _context.SaveChangesAsync();
        return table;
        
    }

    public async Task<bool> DeleteTableAsync(int id)
    {
        var table = await _context.Tables.FindAsync(id);
        if (table == null)
        {
            return false;
        }
        _context.Tables.Remove(table);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<Tables?> GetTableByIdAsync(int id)
    {
        return await _context.Tables.FindAsync(id);
    }

    public async Task<Tables> UpdateTableAsync(int id, Tables table)
    {
        var existingTable = await _context.Tables.FindAsync(id);
        if (existingTable == null)
        {
            throw new Exception("Table not found");
        }
        existingTable.TableNumber = table.TableNumber;
        existingTable.QrCodeUrl = table.QrCodeUrl;
        await _context.SaveChangesAsync();
        return existingTable;
    }
}
