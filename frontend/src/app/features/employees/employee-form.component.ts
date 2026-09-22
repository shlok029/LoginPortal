import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { EmployeeService } from '../../core/services/employee.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.css'
})
export class EmployeeFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly employeeForm = this.formBuilder.nonNullable.group({
    employeeCode: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    department: ['', Validators.required],
    designation: ['', Validators.required]
  });

  readonly employeeId = Number(this.route.snapshot.paramMap.get('id')) || null;
  readonly isEdit = this.employeeId !== null;
  readonly username = this.getLoggedInUsername();
  isLoading = this.isEdit;
  isSaving = false;
  errorMessage = '';

  constructor() {
    if (this.employeeId !== null) {
      this.loadEmployee(this.employeeId);
    }
  }

  submit(): void {
    if (this.employeeForm.invalid || this.isSaving) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    const request = this.employeeForm.getRawValue();
    const saveRequest = this.employeeId === null
      ? this.employeeService.create(request)
      : this.employeeService.update(this.employeeId, request);

    saveRequest.subscribe({
      next: () => {
        void this.router.navigate(['/employees'], {
          state: { successMessage: this.isEdit ? 'Employee updated successfully.' : 'Employee created successfully.' }
        });
      },
      error: (error: HttpErrorResponse) => {
        this.isSaving = false;
        this.errorMessage = this.getErrorMessage(error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  private loadEmployee(id: number): void {
    this.employeeService.getById(id).subscribe({
      next: (employee) => {
        this.employeeForm.patchValue({
          employeeCode: employee.employeeCode,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          phone: employee.phone,
          department: employee.department,
          designation: employee.designation
        });
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error, 'Employee could not be loaded.');
      }
    });
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

  private getErrorMessage(error: HttpErrorResponse, fallback = 'Employee could not be saved.'): string {
    if (!error.status) {
      return 'The server could not be reached. Check that the API is running and try again.';
    }
    if (error.status === 400) {
      return 'The request was not valid. Employee code may already be in use.';
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
