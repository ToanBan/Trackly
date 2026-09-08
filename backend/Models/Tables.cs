namespace MyApi.Models;


public class Tables
{
    public int Id {get ; set;}
    public string TableNumber {get; set;} = string.Empty;

    public required string Slug {get; set;}

    public required string Status {get;set;}

    public required string QrCodeUrl {get;set;}

    public DateTime CreatedAt {get;set;}

    
}