namespace MyApi.Services;

using MyApi.Interfaces;
using MyApi.Models;
using MyApi.DTOS;
using MyApi.Helpers;

public class DishesService
{
    private readonly IDishRepository _dishRepository;
    private readonly IWebHostEnvironment _environment;
    private readonly ICacheInterface _cache;

    private const string ListCachePrefix = "dishes:list:";
    private const string DetailCachePrefix = "dish:detail:";
    private const string CategoriesCachePrefix = "categories:list:";
    private static readonly TimeSpan ListCacheTtl = TimeSpan.FromMinutes(1);
    private static readonly TimeSpan DetailCacheTtl = TimeSpan.FromMinutes(2);

    public DishesService(IDishRepository dishRepository, IWebHostEnvironment environment, ICacheInterface cache)
    {
        _dishRepository = dishRepository;
        _environment = environment;
        _cache = cache;
    }

    public async Task<Dishes> AddDish(CreateDish dish, int userId)
    {
        if (dish.Price <= 0)
        {
            throw new Exception("Price grather than 0");
        }

        var folderPath = Path.Combine(_environment.WebRootPath, "dishes");
        if (!Directory.Exists(folderPath))
        {
            Directory.CreateDirectory(folderPath);
        }
        string? imagePath = null;
        if (dish.ImageUrl != null && dish.ImageUrl.Length > 0)
        {
            var extension = Path.GetExtension(dish.ImageUrl.FileName);
            var fileName = $"{GenUuid.GenerateUuid()}{extension}";
            var fullPath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await dish.ImageUrl.CopyToAsync(stream);
            }
            imagePath = $"/dishes/{fileName}";
        }

        var newDish = new Dishes
        {
            Name = dish.Name,
            Description = dish.Description,
            ImageUrl = imagePath,
            Price = dish.Price,
            CategoryId = dish.CategoryId,
            UserId = userId,
            IsAvailable=true
        };
        await _dishRepository.AddDishAsync(newDish);
        await _cache.RemoveByPrefixAsync(ListCachePrefix);
        await _cache.RemoveByPrefixAsync(CategoriesCachePrefix);
        return newDish;
    }


    public async Task<List<Dishes>> GetListDishes(int limit, int page)
    {
        if (page < 1) page = 1;
        if (limit < 1) limit = 10;

        var key = $"{ListCachePrefix}{limit}:{page}";
        var cached = await _cache.GetAsync<List<Dishes>>(key);
        if (cached != null)
        {
            return cached;
        }

        var offset = (page - 1) * limit;
        var dishes = await _dishRepository.GetListDishesAsync(limit, offset);

        await _cache.SetAsync(key, dishes, ListCacheTtl);
        return dishes;
    }

    public async Task<Dishes> GetDishDetail(int Id)
    {
        // Read-through cache: return early on cache hit.
        var key = $"{DetailCachePrefix}{Id}";
        var cached = await _cache.GetAsync<Dishes>(key);
        if (cached != null)
        {
            return cached;
        }

        var existed = await _dishRepository.GetDishByIdAsync(Id);
        if (existed == null)
        {
            throw new Exception("Not Found");
        }

        // Negative results are not cached; only successful fetches are cached.
        await _cache.SetAsync(key, existed, DetailCacheTtl);
        return existed;
    }


    public async Task<bool> DeleteDishById(int Id)
    {
        var existed = await _dishRepository.GetDishByIdAsync(Id);
        if (existed == null)
        {
            return false;
        }

        await _dishRepository.DeleteDishByIdAsync(Id);
        await _cache.RemoveByPrefixAsync(ListCachePrefix);
        await _cache.RemoveByPrefixAsync(CategoriesCachePrefix);
        await _cache.RemoveAsync($"{DetailCachePrefix}{Id}");
        return true;
    }


    public async Task<Dishes> UpdateDishById(int Id, UpdateDish dish)
    {
        var existed = await _dishRepository.GetDishByIdAsync(Id);
        if (existed == null)
        {
            throw new Exception("Category not found");
        }

        var oldPath = existed.ImageUrl;
        string? newImagePath = oldPath;

        if (dish.ImageUrl != null && dish.ImageUrl.Length > 0)
        {
            var folderPath = Path.Combine(_environment.WebRootPath, "dishes");
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            var extension = Path.GetExtension(dish.ImageUrl.FileName);
            var fileName = $"{GenUuid.GenerateUuid()}{extension}";
            var fullPath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await dish.ImageUrl.CopyToAsync(stream);
            }

            newImagePath = $"/dishes/{fileName}";

            if (!string.IsNullOrEmpty(oldPath))
            {
                var oldFullPath = Path.Combine(_environment.WebRootPath, oldPath.TrimStart('/'));
                if (File.Exists(oldFullPath))
                {
                    File.Delete(oldFullPath);
                }
            }
        }
        existed.Name = dish.Name ?? existed.Name;
        existed.Description = dish.Description ?? existed.Description;
        existed.ImageUrl = newImagePath;
        existed.Price = dish.Price ?? existed.Price;
        existed.IsAvailable = dish.IsAvailable ?? existed.IsAvailable;
        var updateDish = await _dishRepository.UpdateDishByIdAsync(Id, existed);

        await _cache.RemoveByPrefixAsync(ListCachePrefix);
        await _cache.RemoveByPrefixAsync(CategoriesCachePrefix);
        await _cache.RemoveAsync($"{DetailCachePrefix}{Id}");
        return updateDish;
    }
}