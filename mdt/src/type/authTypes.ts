export interface UserRegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface VerificationResponse {
  success: boolean;
  data?: any;
  error?: string;
}
