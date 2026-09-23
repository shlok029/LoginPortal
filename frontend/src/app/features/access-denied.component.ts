import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [RouterLink],
  template: `<main class="access-denied"><p class="eyebrow">Employee Portal</p><h1>Access Denied</h1><p>You do not have permission to access this page.</p><a routerLink="/dashboard">Back to Dashboard</a></main>`,
  styles: [`.access-denied{min-height:100vh;padding:64px clamp(24px,8vw,120px);background:#f5f3ee;color:#1f2925}.eyebrow{color:#c24e31;font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase}h1{margin:18px 0 12px;font:500 clamp(42px,6vw,72px) Georgia,serif}.access-denied p:not(.eyebrow){color:#64706a;line-height:1.7}.access-denied a{display:inline-block;margin-top:24px;color:#c24e31;font-weight:700}`]
})
export class AccessDeniedComponent {}