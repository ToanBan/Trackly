namespace MyApi.DTOS;


public class CreateDish
{
    public required string Name {get;set;}
    public required int CategoryId {get;set;}

    public string? Description {get; set;}

    public required decimal Price {get;set;}

    public IFormFile? ImageUrl {get;set;}
    
}