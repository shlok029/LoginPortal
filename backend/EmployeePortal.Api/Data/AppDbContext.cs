using EmployeePortal.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EmployeePortal.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Employee>(entity =>
        {
            entity.HasKey(employee => employee.Id);
            entity.HasIndex(employee => employee.EmployeeCode).IsUnique();
            entity.Property(employee => employee.EmployeeCode).IsRequired().HasMaxLength(50);
            entity.Property(employee => employee.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(employee => employee.LastName).IsRequired().HasMaxLength(100);
            entity.Property(employee => employee.Email).IsRequired().HasMaxLength(200);
            entity.Property(employee => employee.Phone).HasMaxLength(30);
            entity.Property(employee => employee.Department).IsRequired().HasMaxLength(100);
            entity.Property(employee => employee.Designation).IsRequired().HasMaxLength(100);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(user => user.Id);
            entity.HasIndex(user => user.Username).IsUnique();
            entity.Property(user => user.Username).IsRequired().HasMaxLength(100);
            entity.Property(user => user.PasswordHash).IsRequired();

            entity.HasOne(user => user.Employee)
                .WithOne(employee => employee.User)
                .HasForeignKey<User>(user => user.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
