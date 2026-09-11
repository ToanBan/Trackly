namespace MyApi.Interfaces;
using MyApi.Models;
public interface IDishRepository
{
    Task<Dishes>AddDishAsync(Dishes dish);
    Task<List<Dishes>>GetListDishesAsync(int limit, int page);
    Task<Dishes>GetDishByIdAsync(int Id);
    Task<Dishes>UpdateDishByIdAsync(int Id, Dishes dish);
    Task<bool>DeleteDishByIdAsync(int Id);
}