namespace MyApi.Repositories;
using MyApi.Data;
using MyApi.Interfaces;
using MyApi.Models;
using Microsoft.EntityFrameworkCore;

public class DishesRepository : IDishRepository
{
    private readonly AppDbContext _context;

    public DishesRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Dishes> AddDishAsync(Dishes dish)
    {
        _context.dishes.Add(dish);
        await _context.SaveChangesAsync();
        return dish;
    }

    public async Task<List<Dishes>> GetListDishesAsync(int limit, int offset)
    {

        return await _context.dishes
            .OrderByDescending(d => d.Id)
            .Skip(offset)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<Dishes> GetDishByIdAsync(int Id)
    {
        var dish = await _context.dishes.FindAsync(Id);
        if (dish == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy dish với Id = {Id}");
        }
        return dish;
    }

    public async Task<Dishes> UpdateDishByIdAsync(int Id, Dishes dish)
    {
        var existing = await _context.dishes.FindAsync(Id);
        if (existing == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy dish với Id = {Id}");
        }

        existing.Name = dish.Name;
        existing.Description = dish.Description;
        existing.Price = dish.Price;
        existing.ImageUrl = dish.ImageUrl;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteDishByIdAsync(int Id)
    {
        var existing = await _context.dishes.FindAsync(Id);
        if (existing == null)
        {
            return false;
        }

        _context.dishes.Remove(existing);
        await _context.SaveChangesAsync();
        return true;
    }
}