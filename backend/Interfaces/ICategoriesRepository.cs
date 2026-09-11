namespace MyApi.Interfaces;
using MyApi.Models;
public interface ICategoriesRepository
{
    Task<Categories>AddCategoryAsync(Categories category);
    Task<List<Categories>>GetListCategoriesAsync(int limit, int offset);
    Task<Categories>GetCategoyByIdAsync(int Id);
    Task<Categories>UpdateCategoryAsync(int Id, Categories category);
    Task<bool>DeleteCategoryByIdAsync(int Id);
}