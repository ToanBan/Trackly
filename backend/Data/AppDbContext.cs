
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

    public DbSet<Orders> Orders { get; set; }
    public DbSet<OrderItems> OrderItems { get; set; }
    public DbSet<Bills> Bills { get; set; }
    public DbSet<Loyalty> Loyalties { get; set; }
    public DbSet<LoyaltyHistory> LoyaltyHistories { get; set; }

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

        // Orders
        modelBuilder.Entity<Orders>()
            .HasOne(o => o.Table)
            .WithMany()
            .HasForeignKey(o => o.TableId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Orders>()
            .HasOne(o => o.User)
            .WithMany()
            .HasForeignKey(o => o.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Orders>()
            .HasOne(o => o.Bill)
            .WithMany(b => b.Orders)
            .HasForeignKey(o => o.BillId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<OrderItems>()
            .HasOne(oi => oi.Order)
            .WithMany(o => o.Items)
            .HasForeignKey(oi => oi.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<OrderItems>()
            .HasOne(oi => oi.Dish)
            .WithMany()
            .HasForeignKey(oi => oi.DishId)
            .OnDelete(DeleteBehavior.Restrict);

        // Bills
        modelBuilder.Entity<Bills>()
            .HasOne(b => b.Table)
            .WithMany()
            .HasForeignKey(b => b.TableId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Bills>()
            .HasOne(b => b.User)
            .WithMany()
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Loyalty: 1-1 với User
        modelBuilder.Entity<Loyalty>()
            .HasOne(l => l.User)
            .WithMany()
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Loyalty>()
            .HasIndex(l => l.UserId)
            .IsUnique();

        modelBuilder.Entity<LoyaltyHistory>()
            .HasOne(h => h.Loyalty)
            .WithMany(l => l.History)
            .HasForeignKey(h => h.LoyaltyId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<LoyaltyHistory>()
            .HasOne(h => h.Bill)
            .WithMany()
            .HasForeignKey(h => h.BillId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}