
using Microsoft.EntityFrameworkCore;
using MyApi.Models;
namespace MyApi.Data;
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options){}

    public DbSet<User> Users { get; set; }
    public DbSet<UserSessions> UserSessions { get; set; }
    
    public DbSet<Tables> Tables { get; set; }

    public DbSet<Categories> categories {get;set;}

    public DbSet<Dishes>dishes {get;set;}

}