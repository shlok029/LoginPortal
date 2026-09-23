using EmployeePortal.Api.Data;
using EmployeePortal.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace EmployeePortal.Api.Seeding;

public static class DevelopmentSeed
{
    private const string DummyPassword = "Test@123";

    private static readonly DummyEmployee[] DummyEmployees =
    [
        new("EMP002", "Avery", "Bennett", "avery.bennett@example.com", "8000000002", "Operations", "Operations Coordinator"),
        new("EMP003", "Maya", "Chen", "maya.chen@example.com", "8000000003", "IT", "Software Engineer"),
        new("EMP004", "Elias", "Morgan", "elias.morgan@example.com", "8000000004", "HR", "People Specialist"),
        new("EMP005", "Nora", "Patel", "nora.patel@example.com", "8000000005", "Finance", "Financial Analyst"),
        new("EMP006", "Theo", "Reed", "theo.reed@example.com", "8000000006", "Marketing", "Content Strategist"),
        new("EMP007", "Iris", "Santos", "iris.santos@example.com", "8000000007", "Sales", "Account Executive"),
        new("EMP008", "Caleb", "Brooks", "caleb.brooks@example.com", "8000000008", "Legal", "Compliance Associate"),
        new("EMP009", "Zoe", "Hart", "zoe.hart@example.com", "8000000009", "Product", "Product Analyst"),
        new("EMP010", "Owen", "Kim", "owen.kim@example.com", "8000000010", "Customer Support", "Support Specialist"),
        new("EMP011", "Lena", "Foster", "lena.foster@example.com", "8000000011", "Analytics", "Data Analyst"),
        new("EMP012", "Miles", "Turner", "miles.turner@example.com", "8000000012", "IT", "QA Engineer"),
        new("EMP013", "Sofia", "Nguyen", "sofia.nguyen@example.com", "8000000013", "HR", "Recruiting Coordinator"),
        new("EMP014", "Evan", "Clarke", "evan.clarke@example.com", "8000000014", "Finance", "Budget Analyst"),
        new("EMP015", "June", "Ellis", "june.ellis@example.com", "8000000015", "Marketing", "Brand Associate"),
        new("EMP016", "Finn", "Wallace", "finn.wallace@example.com", "8000000016", "Operations", "Process Analyst"),
        new("EMP017", "Ari", "Dawson", "ari.dawson@example.com", "8000000017", "Sales", "Sales Coordinator"),
        new("EMP018", "Ruby", "Morris", "ruby.morris@example.com", "8000000018", "Legal", "Legal Operations Analyst"),
        new("EMP019", "Noah", "Vega", "noah.vega@example.com", "8000000019", "Product", "Product Designer"),
        new("EMP020", "Wren", "Parker", "wren.parker@example.com", "8000000020", "Customer Support", "Customer Experience Associate"),
        new("EMP021", "Milo", "Hayes", "milo.hayes@example.com", "8000000021", "Analytics", "Reporting Specialist")
    ];

    public static async Task SeedAsync(AppDbContext db)
    {
        var adminEmployee = await EnsureAdminEmployeeAsync(db);
        await EnsureAdminUserAsync(db, adminEmployee);

        var passwordHasher = new PasswordHasher<User>();
        foreach (var definition in DummyEmployees)
        {
            var employee = await EnsureEmployeeAsync(db, definition);
            await EnsureDummyUserAsync(db, employee, definition.Username, passwordHasher);
        }
    }

    private static async Task<Employee> EnsureAdminEmployeeAsync(AppDbContext db)
    {
        var employee = await db.Employees.SingleOrDefaultAsync(item => item.EmployeeCode == "EMP001");
        if (employee is not null)
        {
            return employee;
        }

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
        return employee;
    }

    private static async Task EnsureAdminUserAsync(AppDbContext db, Employee employee)
    {
        var user = await db.Users.SingleOrDefaultAsync(item => item.Username == "admin");
        if (user is null)
        {
            var passwordHasher = new PasswordHasher<User>();
            user = new User
            {
                Username = "admin",
                EmployeeId = employee.Id,
                Role = UserRoles.Admin,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };
            user.PasswordHash = passwordHasher.HashPassword(user, "Admin@123");
            db.Users.Add(user);
            await db.SaveChangesAsync();
        }
        else if (user.Role != UserRoles.Admin)
        {
            user.Role = UserRoles.Admin;
            await db.SaveChangesAsync();
        }
    }

    private static async Task<Employee> EnsureEmployeeAsync(AppDbContext db, DummyEmployee definition)
    {
        var employee = await db.Employees.SingleOrDefaultAsync(item => item.EmployeeCode == definition.EmployeeCode);
        if (employee is not null)
        {
            return employee;
        }

        if (await db.Employees.AnyAsync(item => item.Email == definition.Email || item.Phone == definition.Phone))
        {
            throw new InvalidOperationException($"Dummy employee data conflicts with an existing email or phone for {definition.EmployeeCode}.");
        }

        employee = new Employee
        {
            EmployeeCode = definition.EmployeeCode,
            FirstName = definition.FirstName,
            LastName = definition.LastName,
            Email = definition.Email,
            Phone = definition.Phone,
            Department = definition.Department,
            Designation = definition.Designation,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsActive = int.Parse(definition.EmployeeCode[3..]) % 4 != 0
        };
        db.Employees.Add(employee);
        await db.SaveChangesAsync();
        return employee;
    }

    private static async Task EnsureDummyUserAsync(AppDbContext db, Employee employee, string username, PasswordHasher<User> passwordHasher)
    {
        var user = await db.Users.SingleOrDefaultAsync(item => item.Username == username);
        if (user is null)
        {
            user = await db.Users.SingleOrDefaultAsync(item => item.EmployeeId == employee.Id);
            if (user is not null && user.Username != "admin" && user.Username != username)
            {
                user.Username = username;
            }
        }

        if (user is null)
        {
            user = new User
            {
                Username = username,
                EmployeeId = employee.Id,
                Role = UserRoles.Employee,
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                PasswordHash = passwordHasher.HashPassword(new User { Username = username }, DummyPassword)
            };
            db.Users.Add(user);
            await db.SaveChangesAsync();
            return;
        }

        if (user.EmployeeId != employee.Id)
        {
            throw new InvalidOperationException($"Dummy username {username} is linked to a different employee.");
        }

        user.Role = UserRoles.Employee;
        user.IsActive = true;
        if (passwordHasher.VerifyHashedPassword(user, user.PasswordHash, DummyPassword) == PasswordVerificationResult.Failed)
        {
            user.PasswordHash = passwordHasher.HashPassword(user, DummyPassword);
        }
        await db.SaveChangesAsync();
    }

    private sealed record DummyEmployee(
        string EmployeeCode,
        string FirstName,
        string LastName,
        string Email,
        string Phone,
        string Department,
        string Designation)
    {
        public string Username => $"employee{int.Parse(EmployeeCode[3..]) - 1:D2}";
    }
}
