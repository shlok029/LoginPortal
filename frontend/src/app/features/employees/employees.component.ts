import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Employee } from '../../core/models/employee.model';
import { EmployeeService } from '../../core/services/employee.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.css'
})
export class EmployeesComponent {
  private readonly employeeService = inject(EmployeeService);
  private readonly authService = inject(AuthService);

  employees: Employee[] = [];
  searchTerm = '';
  isLoading = true;
  deletingId: number | null = null;
  errorMessage = '';
  successMessage = history.state?.successMessage ?? '';
  readonly username = this.getLoggedInUsername();

  constructor() {
    this.loadEmployees();
  }

  get filteredEmployees(): Employee[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.employees;
    }

    return this.employees.filter((employee) => [
      employee.employeeCode,
      employee.firstName,
      employee.lastName,
      employee.email,
      employee.department,
      employee.designation
    ].some((value) => value.toLowerCase().includes(term)));
  }

  loadEmployees(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.employeeService.getAll().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error, 'Employee records could not be loaded.');
      }
    });
  }

  deleteEmployee(employee: Employee): void {
    if (!confirm(`Delete ${employee.firstName} ${employee.lastName}? This action cannot be undone.`)) {
      return;
    }

    this.deletingId = employee.id;
    this.errorMessage = '';
    this.employeeService.delete(employee.id).subscribe({
      next: () => {
        this.deletingId = null;
        this.successMessage = `${employee.firstName} ${employee.lastName} was deleted.`;
        this.loadEmployees();
      },
      error: (error: HttpErrorResponse) => {
        this.deletingId = null;
        this.errorMessage = this.getErrorMessage(error, 'Employee could not be deleted.');
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  private getLoggedInUsername(): string | null {
    const user = localStorage.getItem('employee_portal_user');
    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user).username ?? null;
    } catch {
      return null;
    }
  }

  private getErrorMessage(error: HttpErrorResponse, fallback: string): string {
    if (!error.status) {
      return 'The server could not be reached. Check that the API is running and try again.';
    }
    if (error.status === 400) {
      return 'The request was not valid. Review the employee details and try again.';
    }
    if (error.status === 401) {
      return 'Your session has expired. Please sign in again.';
    }
    if (error.status === 404) {
      return 'That employee could not be found.';
    }
    if (error.status >= 500) {
      return 'The server could not complete the request. Please try again.';
    }
    return fallback;
  }
}