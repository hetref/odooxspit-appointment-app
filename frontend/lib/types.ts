export interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ORGANIZATION";
  emailVerified: boolean;
  createdAt: string;
  updatedAt?: string;
  isMember?: boolean;
  organizationId?: string;
  organization?: Organization;
  adminOrganization?: Organization;
}

export interface Organization {
  id: string;
  name: string;
  location: string;
  businessHours?: BusinessHour[];
  description?: string;
  adminId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BusinessHour {
  day: string;
  from: string;
  to: string;
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
