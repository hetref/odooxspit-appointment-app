"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type Day = {
  name: string;
  enabled: boolean;
  from: string;
  to: string;
};

export default function OrgSettingsPage() {
  const [activeSection, setActiveSection] = useState("organization");
  const [businessHours, setBusinessHours] = useState<Day[]>(
    DAYS.map((day) => ({
      name: day,
      enabled: day !== "Saturday" && day !== "Sunday",
      from: "09:00",
      to: "17:00",
    }))
  );

  const updateBusinessHour = (
    index: number,
    field: keyof Day,
    value: string | boolean
  ) => {
    setBusinessHours((prev) =>
      prev.map((day, i) => (i === index ? { ...day, [field]: value } : day))
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Organization Settings
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your organization details and preferences
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="flex gap-8">
          {/* Left Sidebar Navigation */}
          <nav className="w-56 shrink-0">
            <ul className="space-y-1">
              {[
                "organization",
                "business-hours",
                // "preferences",
                "danger-zone",
              ].map((section) => (
                <li key={section}>
                  <button
                    onClick={() => setActiveSection(section)}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                      activeSection === section
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    }`}
                  >
                    {section
                      .split("-")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Content Panel */}
          <div className="flex-1">
            {/* Organization Section */}
            {activeSection === "organization" && (
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-foreground">
                      Organization
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Update your organization information
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">
                        Business Name{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="businessName"
                        type="text"
                        placeholder="Acme Inc."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessLocation">
                        Business Location{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="businessLocation"
                        type="text"
                        placeholder="San Francisco, CA"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessDescription">
                        Business Description
                      </Label>
                      <Textarea
                        id="businessDescription"
                        placeholder="Tell us about your business..."
                        rows={4}
                      />
                    </div>

                    <Button>Save changes</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Business Hours Section */}
            {activeSection === "business-hours" && (
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-foreground">
                      Business Hours
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Set your operating hours for each day
                    </p>
                  </div>

                  <div className="space-y-3">
                    {businessHours.map((day, index) => (
                      <div key={day.name}>
                        <div className="flex items-center gap-4">
                          <div className="flex w-32 items-center gap-2">
                            <Switch
                              checked={day.enabled}
                              onCheckedChange={(checked) =>
                                updateBusinessHour(index, "enabled", checked)
                              }
                            />
                            <Label className="text-sm font-medium">
                              {day.name}
                            </Label>
                          </div>

                          {day.enabled ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="time"
                                value={day.from}
                                onChange={(e) =>
                                  updateBusinessHour(
                                    index,
                                    "from",
                                    e.target.value
                                  )
                                }
                                className="w-32"
                              />
                              <span className="text-muted-foreground">to</span>
                              <Input
                                type="time"
                                value={day.to}
                                onChange={(e) =>
                                  updateBusinessHour(
                                    index,
                                    "to",
                                    e.target.value
                                  )
                                }
                                className="w-32"
                              />
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Closed
                            </span>
                          )}
                        </div>
                        {index < businessHours.length - 1 && (
                          <Separator className="mt-3" />
                        )}
                      </div>
                    ))}
                  </div>

                  <Button className="mt-6">Update business hours</Button>
                </CardContent>
              </Card>
            )}

            {/* Preferences Section */}
            {/* {activeSection === "preferences" && (
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-foreground">
                      Preferences
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      These settings are for demonstration purposes.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="onlineBookings">
                          Allow online bookings
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Enable customers to book online
                        </p>
                      </div>
                      <Switch id="onlineBookings" />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="manualConfirmation">
                          Require manual confirmation
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Approve bookings before they're confirmed
                        </p>
                      </div>
                      <Switch id="manualConfirmation" />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="publicOrg">
                          Show organization publicly
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Make your organization visible in search
                        </p>
                      </div>
                      <Switch id="publicOrg" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )} */}

            {/* Danger Zone */}
            {activeSection === "danger-zone" && (
              <Card className="border-destructive/50">
                <CardContent className="pt-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-destructive">
                      Danger Zone
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      This action cannot be undone.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Deleting your organization will permanently remove all
                      associated data, including bookings, users, and settings.
                    </p>
                    <Button variant="destructive">Delete Organization</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
