import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);

  readonly username = this.getLoggedInUsername();
  readonly role = this.authService.getRole();
  readonly isAdmin = this.authService.isAdmin();
  stats: DashboardStats | null = null;
  isLoading = true;
  errorMessage = '';

  constructor() {
    if (this.isAdmin) {
      this.loadStats();
    } else {
      this.isLoading = false;
    }
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

  loadStats(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Dashboard statistics could not be loaded. Please try again.';
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
