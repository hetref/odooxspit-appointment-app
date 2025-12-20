const API_BASE_URL = process.env.API_URL || "https://jeanene-unexposed-ingrid.ngrok-free.dev";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  user?: any;
  accessToken?: string;
  refreshToken?: string;
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
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || "Network error");
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

  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  verifyEmail: (token: string, email: string) =>
    api.get(`/auth/verify-email?token=${token}&email=${email}`),

  resendVerification: (email: string) =>
    api.post("/auth/resend-verification-email", { email }),

  logout: (refreshToken?: string) =>
    api.post("/auth/logout", refreshToken ? { refreshToken } : {}),

  refreshToken: (refreshToken: string) =>
    api.post("/auth/refresh-token", { refreshToken }),
};

// User API functions
export const userApi = {
  getMe: (token: string) => api.get("/user/me", token),

  updateProfile: (token: string, data: any) =>
    api.put("/user/update", data, token),

  deleteAccount: (token: string, password: string) =>
    api.delete("/user/delete", token),
};
