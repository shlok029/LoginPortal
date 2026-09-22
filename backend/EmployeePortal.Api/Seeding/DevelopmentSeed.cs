using EmployeePortal.Api.Data;
using EmployeePortal.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace EmployeePortal.Api.Seeding;

public static class DevelopmentSeed
{
    public static async Task SeedAsync(AppDbContext db)
    {
        var employee = await db.Employees.SingleOrDefaultAsync(item => item.EmployeeCode == "EMP001");
        if (employee is null)
        {
            employee = new Employee
            {
                EmployeeCode = "EMP001",
                FirstName = "Admin",
                LastName = "User",
                Email = "admin@example.com",
                Phone = "9999999999",
                Department = "IT",
                Designation = "Administrator",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };
            db.Employees.Add(employee);
            await db.SaveChangesAsync();
        }

        var user = await db.Users.SingleOrDefaultAsync(item => item.Username == "admin");
        if (user is null)
        {
            var passwordHasher = new PasswordHasher<User>();
            user = new User
            {
                Username = "admin",
                EmployeeId = employee.Id,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };
            user.PasswordHash = passwordHasher.HashPassword(user, "Admin@123");
            db.Users.Add(user);
            await db.SaveChangesAsync();
        }
    }
}