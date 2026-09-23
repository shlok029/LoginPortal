import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { AccountService } from '../../core/services/account.service';

function matchingPasswords(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return newPassword && confirmPassword && newPassword !== confirmPassword ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly accountService = inject(AccountService);
  private readonly authService = inject(AuthService);

  readonly username = this.getLoggedInUsername();
  readonly isAdmin = this.authService.isAdmin();
  readonly passwordForm = this.formBuilder.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  }, { validators: matchingPasswords });

  isSaving = false;
  isSubmitted = false;
  successMessage = '';
  errorMessage = '';

  submit(): void {
    this.isSubmitted = true;
    this.successMessage = '';
    this.errorMessage = '';
    if (this.passwordForm.invalid || this.isSaving) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    this.accountService.changePassword({ currentPassword, newPassword }).subscribe({
      next: (response) => {
        this.isSaving = false;
        this.passwordForm.reset();
        this.isSubmitted = false;
        this.successMessage = response.message || 'Password changed successfully.';
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

  private getErrorMessage(error: HttpErrorResponse): string {
    if (!error.status) {
      return 'The server could not be reached. Please try again.';
    }
    if (error.status === 400) {
      return error.error?.message || 'The new password does not meet the required policy.';
    }
    if (error.status === 401) {
      return error.error?.message || 'The current password is incorrect.';
    }
    if (error.status >= 500) {
      return 'The server could not complete the request. Please try again.';
    }
    return 'Password could not be changed. Please try again.';
  }
}