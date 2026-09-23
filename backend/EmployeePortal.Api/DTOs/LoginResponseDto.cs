namespace EmployeePortal.Api.DTOs;

public class LoginResponseDto
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int UserId { get; set; }
    public int EmployeeId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string? AccessToken { get; set; }
    public DateTime? ExpiresAt { get; set; }
}