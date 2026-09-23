import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);

  changePassword(request: ChangePasswordRequest): Observable<ChangePasswordResponse> {
    return this.http.post<ChangePasswordResponse>(`${API_BASE_URL}/auth/change-password`, request);
  }

}