"use client"

import Link from 'next/link'
import React from 'react'
import { useUser } from '@/contexts/UserContext'
import { User, Building2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

const page = () => {
    const { user, isLoading } = useUser();

    if (isLoading) {
        return (
            <div className="w-full px-4 xl:px-6 py-6 space-y-6">
                <div className="border-b pb-4 space-y-2">
                    <Skeleton className="h-9 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="space-y-6">
                    <div className="border rounded-lg p-6 space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Skeleton className="h-5 w-5 rounded" />
                            <Skeleton className="h-6 w-48" />
                        </div>
                        <div className="grid gap-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="space-y-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-5 w-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="border rounded-lg p-6">
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-4 xl:px-6 py-6 space-y-6">
            <div className="border-b pb-4">
                <h1 className="text-3xl font-bold">User Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Welcome to your personal dashboard
                </p>
            </div>

            {/* User Information Card */}
            <div className="bg-card border rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5" />
                    <h2 className="text-xl font-semibold">Your Information</h2>
                </div>

                <div className="grid gap-3">
                    <div>
                        <span className="text-sm text-muted-foreground">Name:</span>
                        <p className="font-medium">{user?.name || 'Not set'}</p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">Email:</span>
                        <p className="font-medium">{user?.email}</p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">Role:</span>
                        <p className="font-medium">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                {user?.role}
                            </span>
                        </p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">Account ID:</span>
                        <p className="font-mono text-sm">{user?.id}</p>
                    </div>
                </div>
            </div>

            {/* Convert to Organization Card */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 border rounded-lg p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-card rounded-lg">
                        <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">
                            Upgrade to Organization Account
                        </h3>
                        <p className="text-muted-foreground mb-4">
                            Convert your account to an organization to manage resources,
                            appointments, and team members.
                        </p>
                        <Link
                            href="/dashboard/user/convert-user"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                        >
                            <Building2 className="h-4 w-4" />
                            Convert to Organization
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page 
