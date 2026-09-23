import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Employee } from '../../core/models/employee.model';
import { EmployeeService } from '../../core/services/employee.service';

@Component({
  selector: 'app-employee-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './employee-view.component.html',
  styleUrl: './employee-view.component.css'
})
export class EmployeeViewComponent {
  private readonly employeeService = inject(EmployeeService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly username = this.getLoggedInUsername();
  employee: Employee | null = null;
  employeeId: number | null = null;
  isLoading = true;
  isDeleting = false;
  errorMessage = '';

  constructor() {
    const routeId = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(routeId);
    if (!routeId || !Number.isInteger(parsedId) || parsedId <= 0) {
      this.isLoading = false;
      this.errorMessage = 'The employee ID is invalid.';
      return;
    }

    this.employeeId = parsedId;
    this.loadEmployee(parsedId);
  }

  loadEmployee(id = this.employeeId): void {
    if (id === null) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.employeeService.getById(id).subscribe({
      next: (employee) => {
        this.employee = employee;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = error.status === 404
          ? 'Employee not found.'
          : 'Unable to load employee details. Please try again.';
      }
    });
  }

  deleteEmployee(): void {
    if (!this.employee || this.isDeleting) {
      return;
    }

    const fullName = `${this.employee.firstName} ${this.employee.lastName}`;
    if (!confirm(`Delete ${fullName}? This action cannot be undone.`)) {
      return;
    }

    this.isDeleting = true;
    this.employeeService.delete(this.employee.id).subscribe({
      next: () => {
        void this.router.navigate(['/employees'], {
          state: { successMessage: `${fullName} was deleted.` }
        });
      },
      error: () => {
        this.isDeleting = false;
        this.errorMessage = 'Employee could not be deleted. Please try again.';
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
}
