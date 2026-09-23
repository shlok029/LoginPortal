using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EmployeePortal.Api.Data;
using EmployeePortal.Api.DTOs;
using EmployeePortal.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace EmployeePortal.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AppDbContext db, IConfiguration configuration) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login(LoginRequestDto request)
    {
        var user = await db.Users.Include(item => item.Employee)
            .SingleOrDefaultAsync(item => item.Username == request.Username);

        var passwordHasher = new PasswordHasher<User>();
        var passwordValid = user is not null && user.IsActive && user.Employee is not null &&
            passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password) == PasswordVerificationResult.Success;

        if (user is null || !passwordValid)
        {
            return Unauthorized(new LoginResponseDto
            {
                Success = false,
                Message = "Invalid username or password"
            });
        }

        var issuer = configuration["Jwt:Issuer"] ?? "EmployeePortal.Api";
        var audience = configuration["Jwt:Audience"] ?? "EmployeePortal.Client";
        var expirationMinutes = configuration.GetValue("Jwt:ExpirationMinutes", 60);
        var expiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes);
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
            new Claim("employeeId", user.EmployeeId.ToString()),
            new Claim(ClaimTypes.Role, user.Role)
        };
        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!)),
            SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(issuer, audience, claims, expires: expiresAt, signingCredentials: credentials);

        return Ok(new LoginResponseDto
        {
            Success = true,
            Message = "Login successful",
            UserId = user.Id,
            EmployeeId = user.EmployeeId,
            Username = user.Username,
            Role = user.Role,
            AccessToken = new JwtSecurityTokenHandler().WriteToken(token),
            ExpiresAt = expiresAt
        });
    }

    [HttpPost("change-password")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequestDto request)
    {
        var userIdClaim = User.FindFirstValue(JwtRegisteredClaimNames.Sub) ??
            User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { success = false, message = "Authentication is invalid." });
        }

        var user = await db.Users.SingleOrDefaultAsync(item => item.Id == userId && item.IsActive);
        if (user is null)
        {
            return Unauthorized(new { success = false, message = "Authentication is invalid." });
        }

        var passwordHasher = new PasswordHasher<User>();
        var currentPasswordResult = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.CurrentPassword);
        if (currentPasswordResult == PasswordVerificationResult.Failed)
        {
            return Unauthorized(new { success = false, message = "Current password is incorrect." });
        }

        if (request.NewPassword.Length < 8)
        {
            return BadRequest(new { success = false, message = "New password does not meet the required password policy." });
        }

        if (request.CurrentPassword == request.NewPassword)
        {
            return BadRequest(new { success = false, message = "New password must be different from the current password." });
        }

        user.PasswordHash = passwordHasher.HashPassword(user, request.NewPassword);
        await db.SaveChangesAsync();

        return Ok(new { success = true, message = "Password changed successfully." });
    }

}