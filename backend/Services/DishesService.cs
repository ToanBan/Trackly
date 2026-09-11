namespace MyApi.Services;

using MyApi.Interfaces;
using MyApi.Models;
using MyApi.DTOS;
using MyApi.Helpers;

public class DishesService
{
    private readonly IDishRepository _dishRepository;
    private readonly IWebHostEnvironment _environment;
    public DishesService(IDishRepository dishRepository, IWebHostEnvironment environment)
    {
        _dishRepository = dishRepository;
        _environment = environment;
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
        return newDish;
    }


    public async Task<List<Dishes>> GetListDishes(int limit, int page)
    {
        if (page < 1) page = 1;
        if (limit < 1) limit = 10;
        var offset = (page - 1) * limit;
        var dishes = await _dishRepository.GetListDishesAsync(limit, offset);
        return dishes;
    }

    public async Task<Dishes> GetDishDetail(int Id)
    {
        var existed = await _dishRepository.GetDishByIdAsync(Id);
        if (existed == null)
        {
            throw new Exception("Not Found");
        }
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
        return updateDish;
    }
}