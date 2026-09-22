using System.ComponentModel.DataAnnotations;

namespace EmployeePortal.Api.DTOs;

public class EmployeeCreateDto
{
    [Required, StringLength(50)]
    public string EmployeeCode { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required, EmailAddress, StringLength(200)]
    public string Email { get; set; } = string.Empty;

    [StringLength(30)]
    public string Phone { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string Department { get; set; } = string.Empty;

    [Required, StringLength(100)]
    public string Designation { get; set; } = string.Empty;
}