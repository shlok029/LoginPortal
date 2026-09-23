import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { Employee } from '../../core/models/employee.model';
import { EmployeeService } from '../../core/services/employee.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `<main class="profile"><a routerLink="/dashboard">&#8592; Back to dashboard</a><p class="eyebrow">My profile</p><h1>{{ employee?.firstName }} {{ employee?.lastName }}</h1><p *ngIf="isLoading" role="status">Loading profile...</p><p *ngIf="errorMessage" role="alert">{{ errorMessage }}</p><section *ngIf="employee" class="details"><div><span>Employee Code</span><strong>{{ employee.employeeCode }}</strong></div><div><span>First Name</span><strong>{{ employee.firstName }}</strong></div><div><span>Last Name</span><strong>{{ employee.lastName }}</strong></div><div><span>Email</span><strong>{{ employee.email }}</strong></div><div><span>Phone</span><strong>{{ employee.phone || '—' }}</strong></div><div><span>Department</span><strong>{{ employee.department }}</strong></div><div><span>Designation</span><strong>{{ employee.designation }}</strong></div><div><span>Status</span><strong>{{ employee.isActive ? 'Active' : 'Inactive' }}</strong></div></section></main>`,
  styles: [`.profile{min-height:100vh;padding:48px clamp(24px,8vw,120px);background:#f5f3ee;color:#1f2925}.profile>a{color:#c24e31;font-weight:700;text-decoration:none}.eyebrow{margin:48px 0 10px;color:#c24e31;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase}h1{margin:0;font:500 clamp(38px,5vw,64px) Georgia,serif}.details{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;margin-top:40px;background:#d5d8d0}.details div{display:grid;gap:8px;padding:20px;background:#fffdf8}.details span{color:#64706a;font-size:11px;text-transform:uppercase;letter-spacing:1px}.details strong{font-size:15px}@media(max-width:600px){.details{grid-template-columns:1fr}}`]
})
export class ProfileComponent {
  private readonly employeeService = inject(EmployeeService);
  readonly role = inject(AuthService).getRole();
  employee: Employee | null = null;
  isLoading = true;
  errorMessage = '';

  constructor() {
    this.employeeService.getCurrent().subscribe({
      next: employee => { this.employee = employee; this.isLoading = false; },
      error: () => { this.isLoading = false; this.errorMessage = 'Profile could not be loaded. Please try again.'; }
    });
  }
}