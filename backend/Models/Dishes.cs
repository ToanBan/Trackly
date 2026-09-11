namespace MyApi.Models;

public class Dishes
{
    public int Id {get; set;}
    public required int CategoryId {get; set;}

    public string Name {get;set;} = string.Empty;

    public string Description {get;set;} = string.Empty;

    public decimal Price {get;set;}

    public string? ImageUrl {get ; set;}

    public bool IsAvailable {get;set;}

    public required int UserId {get;set;}
    public User? User {get;set;}

    public DateTime CreatedAt {get;set;}

    public Categories? categories {get;set;}
}