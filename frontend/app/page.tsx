"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authStorage, clearAuthData } from "@/lib/auth";
import { userApi, authApi } from "@/lib/api";
import { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Loader, LogOut, User as UserIcon, Mail, Calendar } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = authStorage.getAccessToken();

      if (!accessToken) {
        // Not authenticated, redirect to login
        router.push("/login");
        return;
      }

      try {
        // Fetch user data from API
        const response = await userApi.getMe(accessToken);

        if (response.success && response.user) {
          setUser(response.user);
          // Update stored user data
          authStorage.setUser(response.user);
        } else {
          // Invalid token, clear auth and redirect
          clearAuthData();
          router.push("/login");
        }
      } catch (error) {
        // Error fetching user, clear auth and redirect
        clearAuthData();
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      const refreshToken = authStorage.getRefreshToken();
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthData();
      router.push("/login");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader className="size-8 animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4">
            <h1 className="text-3xl font-bold text-black dark:text-white">
              Welcome Back!
            </h1>
            <Button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isLoggingOut ? (
                <Loader className="size-4 animate-spin" />
              ) : (
                <>
                  <LogOut className="size-4" />
                  Sign Out
                </>
              )}
            </Button>
          </div>

          {/* User Details Card */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-black dark:text-white">
              Account Details
            </h2>

            <div className="space-y-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg p-6">
              {/* Name */}
              <div className="flex items-center gap-3">
                <UserIcon className="size-5 text-zinc-600 dark:text-zinc-400" />
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Name
                  </p>
                  <p className="font-medium text-black dark:text-white">
                    {user.name}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3">
                <Mail className="size-5 text-zinc-600 dark:text-zinc-400" />
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Email
                  </p>
                  <p className="font-medium text-black dark:text-white">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center gap-3">
                <div className="size-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  {user.role.charAt(0)}
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Role
                  </p>
                  <p className="font-medium text-black dark:text-white">
                    {user.role}
                  </p>
                </div>
              </div>

              {/* Member Since */}
              <div className="flex items-center gap-3">
                <Calendar className="size-5 text-zinc-600 dark:text-zinc-400" />
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Member Since
                  </p>
                  <p className="font-medium text-black dark:text-white">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Email Verification Status */}
              <div className="flex items-center gap-3">
                <div
                  className={`size-5 rounded-full flex items-center justify-center ${
                    user.emailVerified ? "bg-green-500" : "bg-yellow-500"
                  }`}
                >
                  <svg
                    className="size-3 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {user.emailVerified ? (
                      <path d="M5 13l4 4L19 7" />
                    ) : (
                      <path d="M12 8v4m0 4h.01" />
                    )}
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Email Status
                  </p>
                  <p className="font-medium text-black dark:text-white">
                    {user.emailVerified ? "Verified" : "Not Verified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Business Details (if applicable) */}
            {user.business && (
              <div className="space-y-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  Business Information
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Business Name
                    </p>
                    <p className="font-medium text-black dark:text-white">
                      {user.business.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Location
                    </p>
                    <p className="font-medium text-black dark:text-white">
                      {user.business.location}
                    </p>
                  </div>
                  {user.business.workingHours && (
                    <div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Working Hours
                      </p>
                      <p className="font-medium text-black dark:text-white">
                        {user.business.workingHours}
                      </p>
                    </div>
                  )}
                  {user.business.description && (
                    <div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Description
                      </p>
                      <p className="font-medium text-black dark:text-white">
                        {user.business.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
