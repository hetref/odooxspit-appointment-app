"use client";

import { User } from "./types";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

// Cookie helper functions
export const setCookie = (name: string, value: string, days: number = 30) => {
  if (typeof window !== "undefined") {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  }
};

export const getCookie = (name: string): string | null => {
  if (typeof window !== "undefined") {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
};

export const deleteCookie = (name: string) => {
  if (typeof window !== "undefined") {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
};

export const authStorage = {
  // Access Token
  setAccessToken: (token: string) => {
    if (typeof window !== "undefined") {
      // Store in all three storage mechanisms for maximum compatibility
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
      setCookie(ACCESS_TOKEN_KEY, token, 1); // 1 day for access token
    }
  },

  getAccessToken: (): string | null => {
    if (typeof window !== "undefined") {
      // Check sessionStorage first (current tab session)
      // Then localStorage (persistent across tabs)
      // Finally cookies (for SSR/middleware access)
      return (
        sessionStorage.getItem(ACCESS_TOKEN_KEY) ||
        localStorage.getItem(ACCESS_TOKEN_KEY) ||
        getCookie(ACCESS_TOKEN_KEY)
      );
    }
    return null;
  },

  removeAccessToken: () => {
    if (typeof window !== "undefined") {
      // sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      deleteCookie(ACCESS_TOKEN_KEY);
    }
  },

  // Refresh Token
  setRefreshToken: (token: string) => {
    if (typeof window !== "undefined") {
      // Store in all three storage mechanisms
      sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
      setCookie(REFRESH_TOKEN_KEY, token, 30); // 30 days for refresh token
    }
  },

  getRefreshToken: (): string | null => {
    if (typeof window !== "undefined") {
      // Check all storage locations
      return (
        sessionStorage.getItem(REFRESH_TOKEN_KEY) ||
        localStorage.getItem(REFRESH_TOKEN_KEY) ||
        getCookie(REFRESH_TOKEN_KEY)
      );
    }
    return null;
  },

  removeRefreshToken: () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      deleteCookie(REFRESH_TOKEN_KEY);
    }
  },

  // User Data
  setUser: (user: User) => {
    if (typeof window !== "undefined") {
      const userString = JSON.stringify(user);
      // Store in all three storage mechanisms
      sessionStorage.setItem(USER_KEY, userString);
      localStorage.setItem(USER_KEY, userString);
      setCookie(USER_KEY, userString, 30);
    }
  },

  getUser: (): User | null => {
    if (typeof window !== "undefined") {
      // Check all storage locations
      const userString =
        sessionStorage.getItem(USER_KEY) ||
        localStorage.getItem(USER_KEY) ||
        getCookie(USER_KEY);
      return userString ? JSON.parse(userString) : null;
    }
    return null;
  },

  removeUser: () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(USER_KEY);
      localStorage.removeItem(USER_KEY);
      deleteCookie(USER_KEY);
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
  return { name: "John Doe", email: "john.doe@example.com", role: "organizer" };
}
