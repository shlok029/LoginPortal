import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { LoginRequest, LoginResponse } from './auth.models';

const accessTokenKey = 'employee_portal_access_token';
const loginUserKey = 'employee_portal_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/auth/login`, request).pipe(
      tap((response) => {
        if (response.success && response.accessToken) {
          localStorage.setItem(accessTokenKey, response.accessToken);
          localStorage.setItem(loginUserKey, JSON.stringify({
            userId: response.userId,
            employeeId: response.employeeId,
            username: response.username,
            expiresAt: response.expiresAt
          }));
        }
      })
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem(accessTokenKey);
  }

  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }

  logout(): void {
    localStorage.removeItem(accessTokenKey);
    localStorage.removeItem(loginUserKey);
    void this.router.navigate(['/login']);
  }
}
