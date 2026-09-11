namespace MyApi.Repositories;
using MyApi.Models;
using MyApi.Data;
using MyApi.Interfaces;
using Microsoft.EntityFrameworkCore;

public class CategoriesRepository : ICategoriesRepository
{
    private readonly AppDbContext _context;

    public CategoriesRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Categories> AddCategoryAsync(Categories category)
    {
        _context.categories.Add(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task<List<Categories>> GetListCategoriesAsync(int limit, int offset)
    {
        return await _context.categories
            .OrderByDescending(c => c.Id) // mới nhất lên đầu, tùy bạn muốn sort theo gì
            .Skip(offset)
            .Take(limit)
            .ToListAsync();
    }

    public async Task<Categories> GetCategoyByIdAsync(int Id)
    {
        var category = await _context.categories.FindAsync(Id);
        if (category == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy category với Id = {Id}");
        }
        return category;
    }

    public async Task<Categories> UpdateCategoryAsync(int Id, Categories category)
    {
        var existing = await _context.categories.FindAsync(Id);
        if (existing == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy category với Id = {Id}");
        }

        existing.Name = category.Name;
        existing.Description = category.Description;
        existing.ImageUrl = category.ImageUrl;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteCategoryByIdAsync(int Id)
    {
        var existing = await _context.categories.FindAsync(Id);
        if (existing == null)
        {
            return false;
        }

        _context.categories.Remove(existing);
        await _context.SaveChangesAsync();
        return true;
    }
}