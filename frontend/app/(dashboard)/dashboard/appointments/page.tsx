"use client";

import { useEffect, useState } from "react";
import OrgAppointments from "@/components/dashboard/org-appointments";
import UserAppointmentsPage from "@/components/dashboard/user/appointments-list";
import { GetUserData } from "@/lib/auth";

export default function AppointmentPage() {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const userData = await GetUserData();
      setUserRole(userData.role);
    };
    fetchUserRole();
  }, []);

  if (!userRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // If role is "customer", show UserAppointmentsPage
  // If role is "organizer" or "admin", show OrgAppointments
  return userRole === "customer" ? (
    <OrgAppointments />
  ) : (
    <UserAppointmentsPage />
  );
}
