using EmployeePortal.Api.Data;
using EmployeePortal.Api.DTOs;
using EmployeePortal.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EmployeePortal.Api.Controllers;

[ApiController]
[Route("api/employees")]
[Authorize]
public class EmployeesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EmployeeResponseDto>>> GetAll()
    {
        var employees = await db.Employees.AsNoTracking().OrderBy(item => item.Id).ToListAsync();
        return Ok(employees.Select(ToResponse));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<EmployeeResponseDto>> GetById(int id)
    {
        var employee = await db.Employees.AsNoTracking().SingleOrDefaultAsync(item => item.Id == id);
        return employee is null ? NotFound() : Ok(ToResponse(employee));
    }

    [HttpPost]
    public async Task<ActionResult<EmployeeResponseDto>> Create(EmployeeCreateDto request)
    {
        if (await db.Employees.AnyAsync(item => item.EmployeeCode == request.EmployeeCode))
        {
            ModelState.AddModelError(nameof(request.EmployeeCode), "Employee code must be unique.");
            return ValidationProblem(ModelState);
        }

        var now = DateTime.UtcNow;
        var employee = new Employee
        {
            EmployeeCode = request.EmployeeCode,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Phone = request.Phone,
            Department = request.Department,
            Designation = request.Designation,
            CreatedAt = now,
            UpdatedAt = now,
            IsActive = true
        };
        db.Employees.Add(employee);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = employee.Id }, ToResponse(employee));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<EmployeeResponseDto>> Update(int id, EmployeeUpdateDto request)
    {
        var employee = await db.Employees.SingleOrDefaultAsync(item => item.Id == id);
        if (employee is null)
        {
            return NotFound();
        }

        if (await db.Employees.AnyAsync(item => item.EmployeeCode == request.EmployeeCode && item.Id != id))
        {
            ModelState.AddModelError(nameof(request.EmployeeCode), "Employee code must be unique.");
            return ValidationProblem(ModelState);
        }

        employee.EmployeeCode = request.EmployeeCode;
        employee.FirstName = request.FirstName;
        employee.LastName = request.LastName;
        employee.Email = request.Email;
        employee.Phone = request.Phone;
        employee.Department = request.Department;
        employee.Designation = request.Designation;
        employee.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Ok(ToResponse(employee));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var employee = await db.Employees.Include(item => item.User).SingleOrDefaultAsync(item => item.Id == id);
        if (employee is null)
        {
            return NotFound();
        }

        if (employee.User is not null)
        {
            db.Users.Remove(employee.User);
        }
        db.Employees.Remove(employee);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static EmployeeResponseDto ToResponse(Employee employee) => new()
    {
        Id = employee.Id,
        EmployeeCode = employee.EmployeeCode,
        FirstName = employee.FirstName,
        LastName = employee.LastName,
        Email = employee.Email,
        Phone = employee.Phone,
        Department = employee.Department,
        Designation = employee.Designation,
        CreatedAt = employee.CreatedAt,
        UpdatedAt = employee.UpdatedAt,
        IsActive = employee.IsActive
    };
}