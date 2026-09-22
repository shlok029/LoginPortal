namespace EmployeePortal.Api.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public int EmployeeId { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }

    public Employee Employee { get; set; } = null!;
}
