namespace MyApi.Models;

public class Categories
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public string? ImageUrl { get; set; }

    public bool IsActive { get ; set; }
    public DateTime CreatedAt { get; set; }
}