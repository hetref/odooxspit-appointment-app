"use client";

import type React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const weekDays = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export default function OnboardingPage() {
  const [businessHours, setBusinessHours] = useState(
    weekDays.map((day) => ({
      day,
      enabled: day !== "SATURDAY" && day !== "SUNDAY",
      from: "09:00",
      to: "17:00",
    }))
  );

  const handleTimeChange = (
    index: number,
    field: "from" | "to",
    value: string
  ) => {
    const updated = [...businessHours];
    updated[index][field] = value;
    setBusinessHours(updated);
  };

  const toggleDay = (index: number) => {
    const updated = [...businessHours];
    updated[index].enabled = !updated[index].enabled;
    setBusinessHours(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      business: {
        name: (e.target as any).name.value,
        location: (e.target as any).location.value,
        description: (e.target as any).description.value,
        businessHours: businessHours
          .filter((d) => d.enabled)
          .map(({ day, from, to }) => ({ day, from, to })),
      },
    };

    console.log(payload);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground">
            Set up your organization
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            Tell us a few details about your business to get started
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-8 rounded-lg border border-border bg-card p-6 shadow-sm">
            {/* Business Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Business Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your business name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  Business Location <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  placeholder="City, State or Address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description about your business"
                  rows={3}
                />
              </div>
            </div>

            {/* Business Hours */}
            <div className="space-y-4 border-t border-border pt-6">
              <h2 className="text-lg font-medium text-foreground">
                Business Hours
              </h2>

              <div className="space-y-3">
                {businessHours.map((day, index) => (
                  <div
                    key={day.day}
                    className="flex items-center gap-4 rounded-md border border-border p-3"
                  >
                    <button
                      type="button"
                      onClick={() => toggleDay(index)}
                      className={`w-24 text-left text-sm font-medium ${
                        day.enabled
                          ? "text-foreground"
                          : "text-muted-foreground line-through"
                      }`}
                    >
                      {day.day}
                    </button>

                    <Input
                      type="time"
                      value={day.from}
                      disabled={!day.enabled}
                      onChange={(e) =>
                        handleTimeChange(index, "from", e.target.value)
                      }
                    />

                    <span className="text-sm text-muted-foreground">to</span>

                    <Input
                      type="time"
                      value={day.to}
                      disabled={!day.enabled}
                      onChange={(e) =>
                        handleTimeChange(index, "to", e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end border-t border-border pt-6">
              <Button type="submit" size="lg">
                Create Organization
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
