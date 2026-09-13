namespace MyApi.Services;

using MyApi.Models;
using MyApi.Interfaces;
using MyApi.DTOS;
using MyApi.Helpers;

public class CategoriesService
{
    private readonly ICategoriesRepository _categoryService;
    private readonly IWebHostEnvironment _environment;
    private readonly ICacheInterface _cache;

    private const string ListCachePrefix = "categories:list:";
    private const string DishesCachePrefix = "dishes:list:";
    private const string DishDetailCachePrefix = "dish:detail:";
    private static readonly TimeSpan ListCacheTtl = TimeSpan.FromMinutes(1);

    public CategoriesService(ICategoriesRepository categoryService, IWebHostEnvironment environment, ICacheInterface cache)
    {
        _categoryService = categoryService;
        _environment = environment;
        _cache = cache;
    }

    public async Task<Categories> CreateCategory(CreateCategory category, int userId)
    {
        var folderPath = Path.Combine(_environment.WebRootPath, "categories");
        if (!Directory.Exists(folderPath))
        {
            Directory.CreateDirectory(folderPath);
        }
        string? imagePath = null;
        if (category.ImageUrl != null && category.ImageUrl.Length > 0)
        {
            var extension = Path.GetExtension(category.ImageUrl.FileName);
            var fileName = $"{GenUuid.GenerateUuid()}{extension}";
            var fullPath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await category.ImageUrl.CopyToAsync(stream);
            }
            imagePath = $"/categories/{fileName}";
        }

        var newCategory = new Categories
        {
            Name = category.Name,
            Description = category.Description,
            ImageUrl = imagePath,
            UserId = userId,
            IsActive=true
        };
        await _categoryService.AddCategoryAsync(newCategory);
        await _cache.RemoveByPrefixAsync(ListCachePrefix);
        await _cache.RemoveByPrefixAsync(DishesCachePrefix);
        await _cache.RemoveByPrefixAsync(DishDetailCachePrefix);
        return newCategory;

    }


    public async Task<List<Categories>> GetListCategories(int limit = 10, int page = 1)
    {
        if (page < 1) page = 1;
        if (limit < 1) limit = 10;

        // Read-through cache: return early on cache hit.
        var key = $"{ListCachePrefix}{limit}:{page}";
        var cached = await _cache.GetAsync<List<Categories>>(key);
        if (cached != null)
        {
            return cached;
        }

        int offset = (page - 1) * limit;
        List<Categories> categories = await _categoryService.GetListCategoriesAsync(limit, offset);

        // Populate the cache so subsequent requests hit Redis.
        await _cache.SetAsync(key, categories, ListCacheTtl);
        return categories;
    }

    public async Task<Categories> GetCategoryById(int Id)
    {
        var existed = await _categoryService.GetCategoyByIdAsync(Id);
        if (existed == null)
        {
            throw new Exception("Category not found");
        }
        return existed;
    }

    public async Task<bool> DeleteCategoryById(int Id)
    {
        var existed = await _categoryService.GetCategoyByIdAsync(Id);
        if (existed == null)
        {
            return false;
        }
        await _categoryService.DeleteCategoryByIdAsync(Id);
        await _cache.RemoveByPrefixAsync(ListCachePrefix);
        await _cache.RemoveByPrefixAsync(DishesCachePrefix);
        await _cache.RemoveByPrefixAsync(DishDetailCachePrefix);
        return true;
    }

    public async Task<Categories> UpdateCategoryById(int Id, UpdateCategory category)
    {
        var existed = await _categoryService.GetCategoyByIdAsync(Id);
        if (existed == null)
        {
            throw new Exception("Category not found");
        }

        var oldPath = existed.ImageUrl;
        string? newImagePath = oldPath;

        if (category.ImageUrl != null && category.ImageUrl.Length > 0)
        {
            var folderPath = Path.Combine(_environment.WebRootPath, "categories");
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            var extension = Path.GetExtension(category.ImageUrl.FileName);
            var fileName = $"{GenUuid.GenerateUuid()}{extension}";
            var fullPath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await category.ImageUrl.CopyToAsync(stream);
            }

            newImagePath = $"/categories/{fileName}";

            if (!string.IsNullOrEmpty(oldPath))
            {
                var oldFullPath = Path.Combine(_environment.WebRootPath, oldPath.TrimStart('/'));
                if (File.Exists(oldFullPath))
                {
                    File.Delete(oldFullPath);
                }
            }
        }
        existed.Name = category.Name ?? existed.Name;
        existed.Description = category.Description ?? existed.Description;
        existed.ImageUrl = newImagePath;
        existed.IsActive = category.IsActive ?? existed.IsActive;
        var updateCategory = await _categoryService.UpdateCategoryAsync(Id, existed);
        await _cache.RemoveByPrefixAsync(ListCachePrefix);
        await _cache.RemoveByPrefixAsync(DishesCachePrefix);
        await _cache.RemoveByPrefixAsync(DishDetailCachePrefix);
        return updateCategory;
    }

}