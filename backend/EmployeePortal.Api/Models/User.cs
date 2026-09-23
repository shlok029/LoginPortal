namespace EmployeePortal.Api.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public int EmployeeId { get; set; }
    public string Role { get; set; } = UserRoles.Employee;
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }

    public Employee Employee { get; set; } = null!;
}

public static class UserRoles
{
    public const string Admin = "Admin";
    public const string Employee = "Employee";
}
