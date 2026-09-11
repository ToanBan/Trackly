namespace MyApi.DTOS;

public class CreateCategory
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public IFormFile? ImageUrl { get; set; }
}