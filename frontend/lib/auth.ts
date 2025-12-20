"use client";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ORGANIZATION";
  emailVerified: boolean;
  createdAt: string;
  business?: {
    id: string;
    name: string;
    location: string;
    workingHours?: string;
    description?: string;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

export const authStorage = {
  // Access Token
  setAccessToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  },

  getAccessToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return null;
  },

  removeAccessToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  },

  // Refresh Token
  setRefreshToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  },

  getRefreshToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  },

  removeRefreshToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  // User Data
  setUser: (user: User) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  getUser: (): User | null => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  removeUser: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(USER_KEY);
    }
  },

  // Clear All
  clearAll: () => {
    authStorage.removeAccessToken();
    authStorage.removeRefreshToken();
    authStorage.removeUser();
  },

  // Check if authenticated
  isAuthenticated: (): boolean => {
    return !!authStorage.getAccessToken();
  },
};

// Helper function to save auth data after login
export const saveAuthData = (data: {
  accessToken: string;
  refreshToken: string;
  user: User;
}) => {
  authStorage.setAccessToken(data.accessToken);
  authStorage.setRefreshToken(data.refreshToken);
  authStorage.setUser(data.user);
};

// Helper function to clear auth data on logout
export const clearAuthData = () => {
  authStorage.clearAll();
};

 export const GetUserData = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { name: "John Doe", email: "john.doe@example.com", role: "admin" }; 
  }
