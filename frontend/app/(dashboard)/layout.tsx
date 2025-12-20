"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react"
import Navbar from "@/components/dashboard/navbar";
import { authStorage, clearAuthData } from "@/lib/auth";
import { userApi } from "@/lib/api";
import { User } from "@/lib/types";
import { UserProvider } from "@/contexts/UserContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = authStorage.getAccessToken();

      if (!accessToken) {
        // Not authenticated, redirect to login
        const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
        router.push(loginUrl);
        return;
      }

      try {
        // Validate token with API
        const response = await userApi.getMe(accessToken);

        if (response.success && response.data?.user) {
          const userData = response.data.user;
          setUser(userData);

          // Update cached user data
          authStorage.setUser(userData);

          setIsChecking(false);
        } else {
          // Invalid response, but check if we have cached user
          const cachedUser = authStorage.getUser();
          if (cachedUser) {
            setUser(cachedUser);
            setIsChecking(false);
          } else {
            // No cached data, redirect to login
            const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
            router.push(loginUrl);
          }
        }
      } catch (error: any) {
        console.error("Auth check error:", error);

        // Only clear auth data if it's an unauthorized error (401/403)
        if (error.isUnauthorized) {
          clearAuthData();
          const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
          router.push(loginUrl);
        } else {
          // Network error or temporary issue - use cached data
          const cachedUser = authStorage.getUser();
          if (cachedUser) {
            setUser(cachedUser);
            setIsChecking(false);
          } else {
            // No cached data available
            const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
            router.push(loginUrl);
          }
        }
      }
    };

    checkAuth();
  }, [router, pathname]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin" />
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <UserProvider user={user} isLoading={isChecking}>
      <Navbar />
      <div className="">
        {children}
      </div>
    </UserProvider>
  )
}
