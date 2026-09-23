import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { Employee, EmployeeFormValue } from '../models/employee.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${API_BASE_URL}/employees`;

  getAll(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.endpoint);
  }

  getById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.endpoint}/${id}`);
  }

  getCurrent(): Observable<Employee> {
    return this.http.get<Employee>(`${this.endpoint}/me`);
  }

  create(employee: EmployeeFormValue): Observable<Employee> {
    return this.http.post<Employee>(this.endpoint, employee);
  }

  update(id: number, employee: EmployeeFormValue): Observable<Employee> {
    return this.http.put<Employee>(`${this.endpoint}/${id}`, employee);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}