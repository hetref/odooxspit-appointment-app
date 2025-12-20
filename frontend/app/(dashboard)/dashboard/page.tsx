"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    User as UserIcon,
    Building2,
    Mail,
    Shield,
    CheckCircle,
    XCircle,
    Calendar,
    MapPin,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { authStorage } from "@/lib/auth";
import { userApi } from "@/lib/api";
import { User } from "@/lib/types";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
    const router = useRouter();
    const { user: contextUser, isLoading: contextLoading } = useUser();
    const [user, setUser] = useState<User | null>(contextUser);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Get token from storage
                const accessToken = authStorage.getAccessToken();

                if (!accessToken) {
                    router.push("/login");
                    return;
                }

                // Fetch fresh user data from API
                const response = await userApi.getMe(accessToken);

                if (response.success && response.data?.user) {
                    const userData = response.data.user;
                    setUser(userData);

                    // Update cached user data
                    authStorage.setUser(userData);
                    setError(null);
                } else {
                    // Try to use cached data
                    const cachedUser = authStorage.getUser();
                    if (cachedUser) {
                        setUser(cachedUser);
                    } else {
                        setError("Unable to load user data");
                    }
                }
            } catch (err: any) {
                console.error("Error fetching user data:", err);

                // Try to use cached data on error
                const cachedUser = authStorage.getUser();
                if (cachedUser) {
                    setUser(cachedUser);
                } else {
                    setError("Failed to load user data. Please refresh the page.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (!contextLoading) {
            if (contextUser) {
                setUser(contextUser);
                setIsLoading(false);
            } else {
                fetchUserData();
            }
        }
    }, [contextUser, contextLoading, router]);

    if (isLoading || contextLoading) {
        return (
            <div className="mx-auto p-6 space-y-8">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-80" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="border rounded-lg p-6 space-y-6">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-48" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                {[...Array(5)].map((_, j) => (
                                    <div key={j} className="space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-5 w-full" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center">
                    <XCircle className="size-12 mx-auto mb-4 text-destructive" />
                    <h2 className="text-xl font-semibold mb-2">
                        Error Loading Dashboard
                    </h2>
                    <p className="text-muted-foreground mb-4">
                        {error || "Unable to load user data"}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto py-6 ">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    Welcome back, {user.name || "User"}!
                </h1>
                <p className="text-muted-foreground">
                    Here's an overview of your account
                </p>
            </div>

            {/* User Profile Card */}
            <div className="grid gap-6 md:grid-cols-2 mb-8">
                {/* Account Information */}
                <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                        {user.role === "USER" ? (
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                                <UserIcon className="size-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        ) : (
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                                <Building2 className="size-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        )}
                        <div>
                            <h2 className="text-xl font-semibold">Account Information</h2>
                            <p className="text-sm text-muted-foreground">
                                Your profile details
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Name
                            </label>
                            <p className="text-base font-medium">{user.name || "Not set"}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Mail className="size-4" />
                                Email
                            </label>
                            <p className="text-base font-medium">{user.email}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Shield className="size-4" />
                                Account Type
                            </label>
                            <div className="flex items-center gap-2 mt-1">
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${user.role === "USER"
                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                                        : "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                                        }`}
                                >
                                    {user.role === "USER"
                                        ? "User Account"
                                        : "Organization Account"}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground">
                                Email Verification
                            </label>
                            <div className="flex items-center gap-2 mt-1">
                                {user.emailVerified ? (
                                    <>
                                        <CheckCircle className="size-5 text-green-600" />
                                        <span className="text-sm text-green-600 font-medium">
                                            Verified
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="size-5 text-orange-600" />
                                        <span className="text-sm text-orange-600 font-medium">
                                            Not Verified
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Calendar className="size-4" />
                                Member Since
                            </label>
                            <p className="text-base">
                                {new Date(user.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Organization/Role Specific Information */}
                <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                            {user.role === "ORGANIZATION" ? (
                                <Building2 className="size-6 text-green-600 dark:text-green-400" />
                            ) : (
                                <UserIcon className="size-6 text-green-600 dark:text-green-400" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">
                                {user.role === "ORGANIZATION"
                                    ? "Organization Details"
                                    : "User Status"}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {user.role === "ORGANIZATION"
                                    ? "Your organization info"
                                    : "Your account status"}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {user.role === "ORGANIZATION" ? (
                            <>
                                {user.adminOrganization ? (
                                    <>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Organization Name
                                            </label>
                                            <p className="text-base font-medium">
                                                {user.adminOrganization.name}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                <MapPin className="size-4" />
                                                Location
                                            </label>
                                            <p className="text-base">
                                                {user.adminOrganization.location}
                                            </p>
                                        </div>

                                        {user.adminOrganization.description && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">
                                                    Description
                                                </label>
                                                <p className="text-base">
                                                    {user.adminOrganization.description}
                                                </p>
                                            </div>
                                        )}

                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Organization ID
                                            </label>
                                            <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                                {user.adminOrganization.id}
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <Building2 className="size-12 mx-auto mb-3 text-muted-foreground" />
                                        <p className="text-muted-foreground">
                                            No organization details available
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Member Status
                                    </label>
                                    <p className="text-base">
                                        {user.isMember ? "Organization Member" : "Independent User"}
                                    </p>
                                </div>

                                {user.organization && (
                                    <>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">
                                                Organization
                                            </label>
                                            <p className="text-base font-medium">
                                                {user.organization.name}
                                            </p>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                <MapPin className="size-4" />
                                                Location
                                            </label>
                                            <p className="text-base">{user.organization.location}</p>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        User ID
                                    </label>
                                    <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                        {user.id}
                                    </p>
                                </div>

                                {!user.organization && !user.isMember && (
                                    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <p className="text-sm text-blue-900 dark:text-blue-100">
                                            You're currently an independent user. You can book
                                            appointments with various organizations.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    {user.role === "USER" ? (
                        <>
                            <button
                                onClick={() => router.push("/dashboard/user/appointments")}
                                className="p-4 border rounded-lg hover:bg-accent transition-colors text-left"
                            >
                                <Calendar className="size-6 mb-2 text-primary" />
                                <h3 className="font-semibold">My Appointments</h3>
                                <p className="text-sm text-muted-foreground">
                                    View your bookings
                                </p>
                            </button>
                            <button
                                onClick={() => router.push("/dashboard/user/profile")}
                                className="p-4 border rounded-lg hover:bg-accent transition-colors text-left"
                            >
                                <UserIcon className="size-6 mb-2 text-primary" />
                                <h3 className="font-semibold">Edit Profile</h3>
                                <p className="text-sm text-muted-foreground">
                                    Update your information
                                </p>
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => router.push("/dashboard/org/appointments")}
                                className="p-4 border rounded-lg hover:bg-accent transition-colors text-left"
                            >
                                <Calendar className="size-6 mb-2 text-primary" />
                                <h3 className="font-semibold">Manage Appointments</h3>
                                <p className="text-sm text-muted-foreground">
                                    View all bookings
                                </p>
                            </button>
                            <button
                                onClick={() => router.push("/dashboard/org/resources")}
                                className="p-4 border rounded-lg hover:bg-accent transition-colors text-left"
                            >
                                <Building2 className="size-6 mb-2 text-primary" />
                                <h3 className="font-semibold">Resources</h3>
                                <p className="text-sm text-muted-foreground">
                                    Manage your resources
                                </p>
                            </button>
                            <button
                                onClick={() => router.push("/dashboard/org/settings")}
                                className="p-4 border rounded-lg hover:bg-accent transition-colors text-left"
                            >
                                <Shield className="size-6 mb-2 text-primary" />
                                <h3 className="font-semibold">Organization Settings</h3>
                                <p className="text-sm text-muted-foreground">
                                    Configure your org
                                </p>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Storage Info (Debug) */}
            <div className="mt-6 p-4 bg-muted/50 border rounded-lg">
                <details>
                    <summary className="cursor-pointer font-medium text-sm">
                        Storage Information (Debug)
                    </summary>
                    <div className="mt-3 space-y-2 text-sm">
                        <p>
                            <strong>Access Token:</strong>{" "}
                            {authStorage.getAccessToken() ? "✓ Present" : "✗ Missing"}
                        </p>
                        <p>
                            <strong>Refresh Token:</strong>{" "}
                            {authStorage.getRefreshToken() ? "✓ Present" : "✗ Missing"}
                        </p>
                        <p>
                            <strong>Cached User:</strong>{" "}
                            {authStorage.getUser() ? "✓ Present" : "✗ Missing"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Tokens are stored in sessionStorage, localStorage, and cookies for
                            maximum compatibility.
                        </p>
                    </div>
                </details>
            </div>
        </div>
    );
}
