"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Building2, Clock, Phone, Mail, Save } from "lucide-react";

interface BusinessHours {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export default function OrganizationSettings() {
  const [orgData, setOrgData] = useState({
    name: "Healthcare Solutions Inc.",
    email: "contact@healthcare.com",
    phone: "+1 (555) 987-6543",
    description: "Leading healthcare provider offering comprehensive medical services.",
  });

  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([
    { day: "Monday", isOpen: true, openTime: "09:00", closeTime: "17:00" },
    { day: "Tuesday", isOpen: true, openTime: "09:00", closeTime: "17:00" },
    { day: "Wednesday", isOpen: true, openTime: "09:00", closeTime: "17:00" },
    { day: "Thursday", isOpen: true, openTime: "09:00", closeTime: "17:00" },
    { day: "Friday", isOpen: true, openTime: "09:00", closeTime: "17:00" },
    { day: "Saturday", isOpen: false, openTime: "10:00", closeTime: "14:00" },
    { day: "Sunday", isOpen: false, openTime: "10:00", closeTime: "14:00" },
  ]);

  const [bookingSettings, setBookingSettings] = useState({
    allowOnlineBooking: true,
    advanceBookingDays: 30,
  });

  const updateBusinessHour = (index: number, field: string, value: any) => {
    const updated = [...businessHours];
    updated[index] = { ...updated[index], [field]: value };
    setBusinessHours(updated);
  };

  const handleSaveOrg = () => {
    console.log("Saving organization:", orgData);
  };

  const handleSaveHours = () => {
    console.log("Saving business hours:", businessHours);
  };

  const handleSaveBooking = () => {
    console.log("Saving booking settings:", bookingSettings);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your organization details
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
          <TabsTrigger value="booking">Booking</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Basic information about your organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="orgName"
                    value={orgData.name}
                    onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orgEmail">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="orgEmail"
                      type="email"
                      value={orgData.email}
                      onChange={(e) => setOrgData({ ...orgData, email: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="orgPhone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="orgPhone"
                      type="tel"
                      value={orgData.phone}
                      onChange={(e) => setOrgData({ ...orgData, phone: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgDescription">Description</Label>
                <Textarea
                  id="orgDescription"
                  value={orgData.description}
                  onChange={(e) => setOrgData({ ...orgData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleSaveOrg}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Hours Tab */}
        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
              <CardDescription>Set your operating hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {businessHours.map((hour, index) => (
                  <div key={hour.day} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex items-center gap-3 min-w-35">
                      <Switch
                        checked={hour.isOpen}
                        onCheckedChange={(checked) =>
                          updateBusinessHour(index, "isOpen", checked)
                        }
                      />
                      <Label className="font-medium">{hour.day}</Label>
                    </div>
                    
                    {hour.isOpen ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={hour.openTime}
                          onChange={(e) =>
                            updateBusinessHour(index, "openTime", e.target.value)
                          }
                          className="w-32"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="time"
                          value={hour.closeTime}
                          onChange={(e) =>
                            updateBusinessHour(index, "closeTime", e.target.value)
                          }
                          className="w-32"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Closed</span>
                    )}
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleSaveHours}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Hours
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Booking Settings Tab */}
        <TabsContent value="booking">
          <Card>
            <CardHeader>
              <CardTitle>Booking Settings</CardTitle>
              <CardDescription>Configure online booking options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Online Booking</Label>
                  <p className="text-sm text-muted-foreground">
                    Let clients book appointments online
                  </p>
                </div>
                <Switch
                  checked={bookingSettings.allowOnlineBooking}
                  onCheckedChange={(checked) =>
                    setBookingSettings({
                      ...bookingSettings,
                      allowOnlineBooking: checked,
                    })
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="advanceBooking">Advance Booking (days)</Label>
                <Input
                  id="advanceBooking"
                  type="number"
                  value={bookingSettings.advanceBookingDays}
                  onChange={(e) =>
                    setBookingSettings({
                      ...bookingSettings,
                      advanceBookingDays: parseInt(e.target.value),
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  How far in advance clients can book
                </p>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleSaveBooking}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
