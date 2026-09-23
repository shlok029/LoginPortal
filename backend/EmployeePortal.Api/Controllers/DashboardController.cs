using EmployeePortal.Api.Data;
using EmployeePortal.Api.DTOs;
using EmployeePortal.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeePortal.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize(Roles = UserRoles.Admin)]
public class DashboardController(AppDbContext db) : ControllerBase
{
    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsDto>> GetStats()
    {
        var totalEmployees = await db.Employees.CountAsync();
        var activeEmployees = await db.Employees.CountAsync(item => item.IsActive);
        return Ok(new DashboardStatsDto
        {
            TotalEmployees = totalEmployees,
            ActiveEmployees = activeEmployees,
            InactiveEmployees = totalEmployees - activeEmployees
        });
    }
}