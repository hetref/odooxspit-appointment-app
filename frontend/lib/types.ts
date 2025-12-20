export interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ORGANIZATION";
  emailVerified: boolean;
  createdAt: string;
  updatedAt?: string;
  business?: Business;
}

export interface Business {
  id: string;
  name: string;
  location: string;
  workingHours?: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: "USER" | "ORGANIZATION";
}

export interface LoginData {
  email: string;
  password: string;
}
