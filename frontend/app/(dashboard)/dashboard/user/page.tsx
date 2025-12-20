"use client"

import Link from 'next/link'
import React from 'react'
import { useUser } from '@/contexts/UserContext'
import { User, Building2 } from 'lucide-react'

const page = () => {
    const { user, isLoading } = useUser();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="border-b pb-4">
                <h1 className="text-3xl font-bold">User Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Welcome to your personal dashboard
                </p>
            </div>

            {/* User Information Card */}
            <div className="bg-white dark:bg-gray-800 border rounded-lg p-6 space-y-4">
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
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border rounded-lg p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <Building2 className="h-6 w-6 text-purple-600" />
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
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
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