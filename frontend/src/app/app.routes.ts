import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

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
    path: 'employees',
    canActivate: [authGuard],
    loadComponent: () => import('./features/employees/employees.component').then((module) => module.EmployeesComponent)
  },
  {
    path: 'employees/add',
    canActivate: [authGuard],
    loadComponent: () => import('./features/employees/employee-form.component').then((module) => module.EmployeeFormComponent)
  },
  {
    path: 'employees/edit/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/employees/employee-form.component').then((module) => module.EmployeeFormComponent)
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' }
];
