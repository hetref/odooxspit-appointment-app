import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Share2, Pencil } from "lucide-react";

// Mock data for appointments
const appointments = [
  {
    id: 1,
    name: "Dental care",
    duration: "30 Min Duration",
    resources: ["A1", "A2"],
    meetingCount: "1 Meeting Upcoming",
    status: "published" as const,
  },
  {
    id: 2,
    name: "Tennis court",
    duration: "60 Min Duration",
    resources: ["R1", "R2"],
    meetingCount: "1 Meeting Upcoming",
    status: "published" as const,
  },
  {
    id: 3,
    name: "Interviews",
    duration: "45 Min Duration",
    resources: ["A1"],
    meetingCount: "1 Meeting Upcoming",
    status: "unpublished" as const,
  },
];

export default function OrgAppointments() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Page Title Section */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="mb-1 text-3xl font-semibold tracking-tight text-foreground">
              Appointments
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage and configure your appointment types
            </p>
          </div>
          <Button className="bg-foreground text-background hover:bg-foreground/90">
            New Appointment
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <Input
            type="search"
            placeholder="Search appointments"
            className="max-w-md bg-background"
          />
        </div>

        {/* Appointments List */}
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center gap-6 rounded-lg border bg-card px-6 py-5 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Appointment Details */}
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-4">
                  <h3 className="text-base font-semibold text-card-foreground">
                    {appointment.name}
                  </h3>
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {appointment.duration}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {/* Resources */}
                  <div className="flex items-center gap-1.5">
                    {appointment.resources.map((resource) => (
                      <Badge
                        key={resource}
                        variant="secondary"
                        className="h-6 px-2.5 text-xs font-medium"
                      >
                        {resource}
                      </Badge>
                    ))}
                  </div>
                  {/* Meeting Count */}
                  <span className="text-sm text-muted-foreground">
                    {appointment.meetingCount}
                  </span>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center gap-3">
                {/* Status Badge */}
                <Badge
                  variant={
                    appointment.status === "published" ? "default" : "secondary"
                  }
                  className={
                    appointment.status === "published"
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground hover:bg-muted"
                  }
                >
                  {appointment.status === "published"
                    ? "Published"
                    : "Unpublished"}
                </Badge>

                {/* Action Buttons */}
                <Button
                  variant="secondary"
                  size="sm"
                  className="gap-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-border text-foreground bg-transparent"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
