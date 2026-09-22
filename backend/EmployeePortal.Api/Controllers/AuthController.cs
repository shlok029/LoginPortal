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
        var passwordValid = user is not null && user.IsActive && user.Employee?.IsActive == true &&
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
            new Claim("employeeId", user.EmployeeId.ToString())
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
            AccessToken = new JwtSecurityTokenHandler().WriteToken(token),
            ExpiresAt = expiresAt
        });
    }
}