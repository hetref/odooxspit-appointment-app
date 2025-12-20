"use client";

import { useEffect, useState } from "react";
import { GetUserData } from "@/lib/auth";
import UserDashboardHome from "@/components/dashboard/user/dashboard-home";
import OrgDashboardHome from "@/components/dashboard/organization/dashboard-home";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = await GetUserData();
      setUserRole(userData?.role || null);
      setLoading(false);
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (userRole === "organizer" || userRole === "admin") {
    return <OrgDashboardHome />;
  }

  return <UserDashboardHome />;
}
