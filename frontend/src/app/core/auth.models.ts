export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  userId: number;
  employeeId: number;
  username: string;
  role: string;
  accessToken?: string;
  expiresAt?: string;
}
