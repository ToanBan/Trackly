
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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Restrict: deleting a user must not cascade-delete their categories/dishes
        modelBuilder.Entity<Categories>()
            .HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Dishes>()
            .HasOne(d => d.User)
            .WithMany()
            .HasForeignKey(d => d.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}