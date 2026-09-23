import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { roleGuard } from './core/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then((module) => module.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then((module) => module.DashboardComponent)
  },
  {
    path: 'access-denied',
    canActivate: [authGuard],
    loadComponent: () => import('./features/access-denied.component').then((module) => module.AccessDeniedComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then((module) => module.ProfileComponent)
  },
  {
    path: 'change-password',
    canActivate: [authGuard],
    loadComponent: () => import('./features/auth/change-password.component').then((module) => module.ChangePasswordComponent)
  },
  {
    path: 'employees',
    canActivate: [roleGuard],
    data: { role: 'Admin' },
    loadComponent: () => import('./features/employees/employees.component').then((module) => module.EmployeesComponent)
  },
  {
    path: 'employees/add',
    canActivate: [roleGuard],
    data: { role: 'Admin' },
    loadComponent: () => import('./features/employees/employee-form.component').then((module) => module.EmployeeFormComponent)
  },
  {
    path: 'employees/edit/:id',
    canActivate: [roleGuard],
    data: { role: 'Admin' },
    loadComponent: () => import('./features/employees/employee-form.component').then((module) => module.EmployeeFormComponent)
  },
  {
    path: 'employees/view/:id',
    canActivate: [roleGuard],
    data: { role: 'Admin' },
    loadComponent: () => import('./features/employees/employee-view.component').then((module) => module.EmployeeViewComponent)
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' }
];
