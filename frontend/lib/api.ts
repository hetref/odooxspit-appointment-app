import { User, Organization } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://jeanene-unexposed-ingrid.ngrok-free.dev";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  user?: any;
  accessToken?: string;
  refreshToken?: string;
}

// Specific response types for better type safety
export interface UserMeResponse {
  user: User;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ConvertToOrganizationResponse {
  user: User;
  organization: Organization;
}

export interface ResourcesResponse {
  resources: Array<{
    id: string;
    name: string;
    capacity: number;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface ResourceResponse {
  resource: {
    id: string;
    name: string;
    capacity: number;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true", // Skip ngrok browser warning
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Get content type to check if it's JSON
      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");

      let data: any;

      if (isJson) {
        try {
          data = await response.json();
        } catch (parseError) {
          // JSON parsing failed
          const error: any = new Error("Invalid JSON response from server");
          error.status = response.status;
          error.isNetworkError = true;
          throw error;
        }
      } else {
        // Not JSON - likely HTML error page or ngrok page
        const textResponse = await response.text();
        console.error("Non-JSON response received:", textResponse.substring(0, 200));

        const error: any = new Error(
          response.status === 404
            ? "API endpoint not found. Please check your API server is running."
            : "Server returned non-JSON response. API may be unreachable."
        );
        error.status = response.status;
        error.isUnauthorized = response.status === 401 || response.status === 403;
        error.isNetworkError = response.status >= 500 || !isJson;
        throw error;
      }

      if (!response.ok) {
        const error: any = new Error(data.message || "Something went wrong");
        error.status = response.status;
        error.isUnauthorized = response.status === 401 || response.status === 403;
        throw error;
      }

      return data;
    } catch (error: any) {
      // If error already has status, re-throw it
      if (error.status !== undefined) {
        throw error;
      }

      // Network error (fetch failed)
      const networkError: any = new Error(
        error.message || "Network error. Please check your internet connection and API server."
      );
      networkError.isNetworkError = true;
      throw networkError;
    }
  }

  async get<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return this.request<T>(endpoint, {
      method: "GET",
      headers,
    });
  }

  async post<T>(
    endpoint: string,
    body?: any,
    token?: string
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return this.request<T>(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  }

  async put<T>(
    endpoint: string,
    body?: any,
    token?: string
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return this.request<T>(endpoint, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return this.request<T>(endpoint, {
      method: "DELETE",
      headers,
    });
  }
}

export const api = new ApiClient(API_BASE_URL);

// Auth API functions
export const authApi = {
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post("/auth/register", data),

  login: (data: { email: string; password: string }): Promise<ApiResponse<LoginResponse>> =>
    api.post<LoginResponse>("/auth/login", data),

  verifyEmail: (token: string, email: string) =>
    api.get(`/auth/verify-email?token=${token}&email=${email}`),

  resendVerification: (email: string) =>
    api.post("/auth/resend-verification-email", { email }),

  logout: (refreshToken?: string) =>
    api.post("/auth/logout", refreshToken ? { refreshToken } : {}),

  refreshToken: (refreshToken: string) =>
    api.post("/auth/refresh-token", { refreshToken }),

  requestPasswordReset: (email: string) =>
    api.post("/auth/request-password-reset", { email }),

  resetPassword: (token: string, email: string, newPassword: string) =>
    api.post("/auth/reset-password", { token, email, newPassword }),
};

// User API functions
export const userApi = {
  getMe: (token: string): Promise<ApiResponse<UserMeResponse>> =>
    api.get<UserMeResponse>("/user/me", token),

  updateProfile: (token: string, data: any) =>
    api.put("/user/update", data, token),

  deleteAccount: (token: string, password: string) =>
    api.delete("/user/delete", token),

  logout: (refreshToken: string) =>
    api.post("/auth/logout", { refreshToken }),

  convertToOrganization: (token: string, business: any): Promise<ApiResponse<ConvertToOrganizationResponse>> =>
    api.post<ConvertToOrganizationResponse>("/user/convert-to-organization", { business }, token),
};

// Organization API functions
export const organizationApi = {
  // Resource Management
  createResource: (token: string, data: { name: string; capacity: number }): Promise<ApiResponse<ResourceResponse>> =>
    api.post<ResourceResponse>("/organization/resources", data, token),

  getResources: (token: string): Promise<ApiResponse<ResourcesResponse>> =>
    api.get<ResourcesResponse>("/organization/resources", token),

  deleteResource: (token: string, resourceId: string) =>
    api.delete(`/organization/resources/${resourceId}`, token),

  // Organization Settings
  updateOrganization: (token: string, data: {
    name?: string;
    location?: string;
    description?: string;
    businessHours?: Array<{ day: string; from: string; to: string }>;
  }) =>
    api.put("/organization/update", data, token),
};
