using System.ComponentModel.DataAnnotations;

namespace EmployeePortal.Api.DTOs;

public class ChangePasswordRequestDto
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required, MinLength(8)]
    public string NewPassword { get; set; } = string.Empty;
}
