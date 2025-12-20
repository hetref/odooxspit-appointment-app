"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, Clock, Share2, Pencil, Copy, Check } from "lucide-react";
import { useState } from "react";

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

function ShareModal({ appointmentName }: { appointmentName: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://bookingapp.com/appointments/${appointmentName
    .toLowerCase()
    .replace(/\s+/g, "-")}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Share Appointment</DialogTitle>
        <DialogDescription>
          Share this appointment link with others. Anyone with the link can book
          an appointment.
        </DialogDescription>
      </DialogHeader>
      <div className="flex items-center gap-2">
        <Input readOnly value={shareUrl} className="flex-1 bg-muted" />
        <Button size="sm" onClick={handleCopy} className="shrink-0">
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1.5" />
              Copy
            </>
          )}
        </Button>
      </div>
    </DialogContent>
  );
}

export default function OrgAppointments() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Page Title Section */}
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Appointments
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage and configure your appointment types
            </p>
          </div>
          <Button className="bg-foreground text-background hover:bg-foreground/90 w-full sm:w-auto">
            New Appointment
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <Input
            type="search"
            placeholder="Search appointments"
            className="w-full bg-background sm:max-w-md"
          />
        </div>

        {/* Appointments List */}
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex flex-col gap-4 rounded-lg border bg-card px-4 py-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:gap-6 sm:px-6 sm:py-5"
            >
              {/* Appointment Details */}
              <div className="flex-1">
                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                  <h3 className="text-base font-semibold text-card-foreground">
                    {appointment.name}
                  </h3>
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {appointment.duration}
                  </span>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
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
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                {/* Status Badge */}
                <Badge
                  variant={
                    appointment.status === "published" ? "default" : "secondary"
                  }
                  className={
                    appointment.status === "published"
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 w-fit"
                      : "bg-muted text-muted-foreground hover:bg-muted w-fit"
                  }
                >
                  {appointment.status === "published"
                    ? "Published"
                    : "Unpublished"}
                </Badge>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 gap-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 sm:flex-none"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        Share
                      </Button>
                    </DialogTrigger>
                    <ShareModal appointmentName={appointment.name} />
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 border-border bg-transparent text-foreground sm:flex-none"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
