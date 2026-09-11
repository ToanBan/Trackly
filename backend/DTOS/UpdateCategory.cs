namespace MyApi.DTOS;
public class UpdateCategory
{
    public string? Name {get;set;}
    public string? Description {get;set;}
    public bool? IsActive {get;set;}

    public IFormFile? ImageUrl {get;set;}
}