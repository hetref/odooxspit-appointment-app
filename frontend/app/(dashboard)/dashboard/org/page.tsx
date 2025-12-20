"use client"

import React from 'react'
import { useUser } from '@/contexts/UserContext'
import { Building2, MapPin, Clock, CheckCircle2 } from 'lucide-react'

const page = () => {
    const { user, isLoading } = useUser();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    const organization = user?.adminOrganization || user?.organization;

    return (
        <div className="space-y-6">
            <div className="border-b pb-4">
                <h1 className="text-3xl font-bold">Organization Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your organization and resources
                </p>
            </div>

            {/* User Role Information */}
            <div className="bg-white dark:bg-gray-800 border rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <h2 className="text-xl font-semibold">Account Information</h2>
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
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {user?.role}
                            </span>
                        </p>
                    </div>
                    {user?.isMember !== undefined && (
                        <div>
                            <span className="text-sm text-muted-foreground">Status:</span>
                            <p className="font-medium">
                                {user.isMember ? 'Member' : 'Administrator'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Organization Information */}
            {organization && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Building2 className="h-5 w-5 text-purple-600" />
                        <h2 className="text-xl font-semibold">Organization Details</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <span className="text-sm text-muted-foreground">Organization Name:</span>
                            <p className="text-lg font-semibold">{organization.name}</p>
                        </div>

                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                            <div>
                                <span className="text-sm text-muted-foreground">Location:</span>
                                <p className="font-medium">{organization.location}</p>
                            </div>
                        </div>

                        {organization.description && (
                            <div>
                                <span className="text-sm text-muted-foreground">Description:</span>
                                <p className="mt-1">{organization.description}</p>
                            </div>
                        )}

                        {organization.businessHours && organization.businessHours.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground font-medium">Business Hours:</span>
                                </div>
                                <div className="grid gap-2 ml-6">
                                    {organization.businessHours.map((hours: any, index: number) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <span className="font-medium min-w-[100px]">{hours.day}:</span>
                                            <span className="text-muted-foreground">
                                                {hours.from} - {hours.to}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <span className="text-sm text-muted-foreground">Organization ID:</span>
                            <p className="font-mono text-sm">{organization.id}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default page