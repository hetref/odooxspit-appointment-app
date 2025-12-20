"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react"
import Navbar from "@/components/dashboard/navbar";
import { authStorage, clearAuthData } from "@/lib/auth";
import { userApi } from "@/lib/api";
import { hasRouteAccess, getRedirectUrl } from "@/lib/routes";
import { User } from "@/lib/types";

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

          // Check if user has access to this route
          if (!hasRouteAccess(pathname, userData.role, true)) {
            // Redirect to appropriate dashboard based on role
            const redirectUrl = getRedirectUrl(userData.role);
            router.push(redirectUrl);
            return;
          }

          setIsChecking(false);
        } else {
          // Invalid token, clear auth and redirect to login
          clearAuthData();
          const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
          router.push(loginUrl);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        // Error fetching user, clear auth and redirect
        clearAuthData();
        const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
        router.push(loginUrl);
      }
    };

    checkAuth();
  }, [router, pathname]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="">
        {children}
      </div>
    </>
  )
}
