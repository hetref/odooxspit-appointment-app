"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  DollarSign,
  CheckCircle2,
  ArrowLeft,
  Image as ImageIcon,
  Trash2,
  Plus,
  Save,
  Eye,
  Settings,
  AlertCircle,
  Users,
  HelpCircle,
  X,
} from "lucide-react";

interface TimeSlot {
  id: string;
  day: string;
  from: string;
  to: string;
}

interface User {
  id: string;
  name: string;
}

interface Resource {
  id: string;
  name: string;
}

interface AppointmentTypeFormData {
  title: string;
  duration: string;
  durationUnit: "hours" | "minutes";
  location: string;
  bookingType: "user" | "resource";
  assignmentType: "automatic" | "visitor";
  selectedUsers: string[];
  selectedResources: string[];
  manageCapacity: boolean;
  capacity: number;
  price: string;
  description: string;
  picture: File | null;
  picturePreview: string | null;
  timeSlots: TimeSlot[];
}

const dummyUsers: User[] = [
  { id: "1", name: "User 1" },
  { id: "2", name: "User 2" },
  { id: "3", name: "User 3" },
  { id: "4", name: "User 4" },
];

const dummyResources: Resource[] = [
  { id: "1", name: "Conference Room A" },
  { id: "2", name: "Conference Room B" },
  { id: "3", name: "Meeting Room 1" },
  { id: "4", name: "Equipment Set A" },
];

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function CreateAppointment({ onBack }: { onBack?: () => void }) {
  const [currentTab, setCurrentTab] = useState("schedule");
  const [formData, setFormData] = useState<AppointmentTypeFormData>({
    title: "",
    duration: "30",
    durationUnit: "minutes",
    location: "",
    bookingType: "user",
    assignmentType: "automatic",
    selectedUsers: [],
    selectedResources: [],
    manageCapacity: false,
    capacity: 1,
    price: "",
    description: "",
    picture: null,
    picturePreview: null,
    timeSlots: [
      { id: "1", day: "Monday", from: "09:00", to: "12:00" },
      { id: "2", day: "Monday", from: "14:00", to: "17:00" },
    ],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Appointment title is required";
    }
    if (!formData.duration || parseFloat(formData.duration) <= 0) {
      newErrors.duration = "Valid duration is required";
    }
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }
    if (formData.bookingType === "user" && formData.selectedUsers.length === 0) {
      newErrors.users = "Please select at least one user";
    }
    if (formData.bookingType === "resource" && formData.selectedResources.length === 0) {
      newErrors.resources = "Please select at least one resource";
    }
    if (formData.timeSlots.length === 0) {
      newErrors.timeSlots = "Please add at least one time slot";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsLoading(false);
    setSuccess(true);

    // Reset form after success
    setTimeout(() => {
      setSuccess(false);
      if (onBack) onBack();
    }, 2000);
  };

  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, picture: file, picturePreview: URL.createObjectURL(file) });
    }
  };

  const removePicture = () => {
    setFormData({ ...formData, picture: null, picturePreview: null });
  };

  const addTimeSlot = () => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      day: "Monday",
      from: "09:00",
      to: "17:00",
    };
    setFormData({ ...formData, timeSlots: [...formData.timeSlots, newSlot] });
  };

  const removeTimeSlot = (id: string) => {
    setFormData({
      ...formData,
      timeSlots: formData.timeSlots.filter((slot) => slot.id !== id),
    });
  };

  const updateTimeSlot = (id: string, field: keyof TimeSlot, value: string) => {
    setFormData({
      ...formData,
      timeSlots: formData.timeSlots.map((slot) =>
        slot.id === id ? { ...slot, [field]: value } : slot
      ),
    });
  };

  const toggleUser = (userId: string) => {
    const isSelected = formData.selectedUsers.includes(userId);
    setFormData({
      ...formData,
      selectedUsers: isSelected
        ? formData.selectedUsers.filter((id) => id !== userId)
        : [...formData.selectedUsers, userId],
    });
  };

  const toggleResource = (resourceId: string) => {
    const isSelected = formData.selectedResources.includes(resourceId);
    setFormData({
      ...formData,
      selectedResources: isSelected
        ? formData.selectedResources.filter((id) => id !== resourceId)
        : [...formData.selectedResources, resourceId],
    });
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 sm:p-12">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold">Appointment Type Created!</h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  {formData.title} has been successfully created and is now available for booking.
                </p>
              </div>
              <Button onClick={onBack} className="w-full sm:w-auto" size="lg">
                Back to Appointments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Top Bar */}
      <div className="border-b bg-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4  mx-auto">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Appointment Form View</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Configure appointment type settings
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none gap-2" size="sm">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
            <Button
              className="flex-1 sm:flex-none gap-2"
              onClick={handleSubmit}
              disabled={isLoading}
              size="sm"
            >
              <Save className="w-4 h-4" />
              {isLoading ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Picture */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Appointment Title</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="title">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Dental care"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="text-lg"
                    />
                    {errors.title && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.title}
                      </p>
                    )}
                  </div>

                  {/* Picture Upload */}
                  <div className="space-y-2">
                    <Label>Picture</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                      {formData.picturePreview ? (
                        <div className="relative">
                          <img
                            src={formData.picturePreview}
                            alt="Preview"
                            className="w-full h-24 object-cover rounded"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={removePicture}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <label className="cursor-pointer block">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePictureUpload}
                          />
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <ImageIcon className="w-8 h-8" />
                            <span className="text-xs">Upload</span>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Duration and Location */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">
                      Duration <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="duration"
                        type="number"
                        placeholder="00:30"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="flex-1"
                      />
                      <select
                        value={formData.durationUnit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            durationUnit: e.target.value as "hours" | "minutes",
                          })
                        }
                        className="px-3 border rounded-md bg-background"
                      >
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                      </select>
                    </div>
                    {errors.duration && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.duration}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">
                      Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="location"
                      placeholder="e.g., Delta's Office"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                    {errors.location && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.location}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Book Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Book</CardTitle>
                <CardDescription>Configure booking settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Booking Type */}
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.bookingType === "user"}
                        onChange={() => setFormData({ ...formData, bookingType: "user" })}
                        className="w-4 h-4"
                      />
                      <User className="w-4 h-4" />
                      <span>User</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.bookingType === "resource"}
                        onChange={() => setFormData({ ...formData, bookingType: "resource" })}
                        className="w-4 h-4"
                      />
                      <MapPin className="w-4 h-4" />
                      <span>Resources</span>
                    </label>
                  </div>
                </div>

                {/* User Selection */}
                {formData.bookingType === "user" && (
                  <div className="space-y-3">
                    <Label>
                      Select Users <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {dummyUsers.map((user) => (
                        <Button
                          key={user.id}
                          type="button"
                          variant={
                            formData.selectedUsers.includes(user.id) ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => toggleUser(user.id)}
                          className="justify-start"
                        >
                          {user.name}
                        </Button>
                      ))}
                    </div>
                    {errors.users && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.users}
                      </p>
                    )}
                  </div>
                )}

                {/* Resource Selection */}
                {formData.bookingType === "resource" && (
                  <div className="space-y-3">
                    <Label>
                      Select Resources <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {dummyResources.map((resource) => (
                        <Button
                          key={resource.id}
                          type="button"
                          variant={
                            formData.selectedResources.includes(resource.id)
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => toggleResource(resource.id)}
                          className="justify-start"
                        >
                          {resource.name}
                        </Button>
                      ))}
                    </div>
                    {errors.resources && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.resources}
                      </p>
                    )}
                  </div>
                )}

                <Separator />

                {/* Assignment Type */}
                <div className="space-y-3">
                  <Label>Assignment</Label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.assignmentType === "automatic"}
                        onChange={() => setFormData({ ...formData, assignmentType: "automatic" })}
                        className="w-4 h-4"
                      />
                      <span>Automatically</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.assignmentType === "visitor"}
                        onChange={() => setFormData({ ...formData, assignmentType: "visitor" })}
                        className="w-4 h-4"
                      />
                      <span>By visitor</span>
                    </label>
                  </div>
                </div>

                {/* Manage Capacity */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="manageCapacity"
                    checked={formData.manageCapacity}
                    onChange={(e) =>
                      setFormData({ ...formData, manageCapacity: e.target.checked })
                    }
                    className="mt-1 w-4 h-4"
                  />
                  <div className="flex-1">
                    <Label htmlFor="manageCapacity" className="cursor-pointer font-normal">
                      Allow multiple appointments per time slot
                    </Label>
                    {formData.manageCapacity && (
                      <Input
                        type="number"
                        placeholder="Max capacity"
                        value={formData.capacity}
                        onChange={(e) =>
                          setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })
                        }
                        className="mt-2 max-w-[150px]"
                        min="1"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs Section */}
            <Card>
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <CardHeader className="pb-3">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                    <TabsTrigger value="schedule" className="text-xs sm:text-sm py-2">
                      Schedule
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="text-xs sm:text-sm py-2">
                      Questions
                    </TabsTrigger>
                    <TabsTrigger value="options" className="text-xs sm:text-sm py-2">
                      Options
                    </TabsTrigger>
                    <TabsTrigger value="misc" className="text-xs sm:text-sm py-2">
                      Misc
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent>
                  <TabsContent value="schedule" className="mt-0 space-y-4">
                    <div className="overflow-x-auto -mx-6 px-6">
                      <table className="w-full min-w-[600px]">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                              Every
                            </th>
                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                              From
                            </th>
                            <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                              To
                            </th>
                            <th className="w-12"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.timeSlots.map((slot, index) => (
                            <tr
                              key={slot.id}
                              className={`border-b ${index % 2 === 0 ? "bg-muted/20" : ""}`}
                            >
                              <td className="py-3 px-2">
                                <select
                                  value={slot.day}
                                  onChange={(e) => updateTimeSlot(slot.id, "day", e.target.value)}
                                  className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                                >
                                  {daysOfWeek.map((day) => (
                                    <option key={day} value={day}>
                                      {day}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-3 px-2">
                                <Input
                                  type="time"
                                  value={slot.from}
                                  onChange={(e) => updateTimeSlot(slot.id, "from", e.target.value)}
                                  className="text-sm"
                                />
                              </td>
                              <td className="py-3 px-2">
                                <Input
                                  type="time"
                                  value={slot.to}
                                  onChange={(e) => updateTimeSlot(slot.id, "to", e.target.value)}
                                  className="text-sm"
                                />
                              </td>
                              <td className="py-3 px-2 text-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeTimeSlot(slot.id)}
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {errors.timeSlots && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.timeSlots}
                      </p>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addTimeSlot}
                      className="w-full sm:w-auto gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add a Line
                    </Button>
                  </TabsContent>

                  <TabsContent value="questions" className="mt-0">
                    <div className="text-center py-12 text-muted-foreground">
                      <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Custom questions can be added here</p>
                      <Button variant="outline" className="mt-4 gap-2">
                        <Plus className="w-4 h-4" />
                        Add Question
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="options" className="mt-0 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="price"
                          type="number"
                          placeholder="0.00"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Add additional details about this appointment type..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="misc" className="mt-0">
                    <div className="text-center py-12 text-muted-foreground">
                      <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Additional settings and configurations</p>
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Right Column - Summary Preview */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
                <CardDescription>How visitors will see this</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.picturePreview && (
                  <div className="rounded-lg overflow-hidden border">
                    <img
                      src={formData.picturePreview}
                      alt="Appointment preview"
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}

                {formData.title && (
                  <>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Title</p>
                      <p className="font-semibold text-lg">{formData.title}</p>
                    </div>
                    <Separator />
                  </>
                )}

                {formData.duration && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Duration</span>
                    </div>
                    <span className="font-medium">
                      {formData.duration} {formData.durationUnit}
                    </span>
                  </div>
                )}

                {formData.location && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>Location</span>
                    </div>
                    <span className="font-medium truncate ml-2">{formData.location}</span>
                  </div>
                )}

                {formData.price && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      <span>Price</span>
                    </div>
                    <span className="font-semibold text-green-600">${formData.price}</span>
                  </div>
                )}

                {formData.selectedUsers.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>Assigned Users</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {formData.selectedUsers.map((userId) => {
                          const user = dummyUsers.find((u) => u.id === userId);
                          return (
                            <Badge key={userId} variant="secondary" className="text-xs">
                              {user?.name}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {formData.selectedResources.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>Assigned Resources</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {formData.selectedResources.map((resourceId) => {
                          const resource = dummyResources.find((r) => r.id === resourceId);
                          return (
                            <Badge key={resourceId} variant="secondary" className="text-xs">
                              {resource?.name}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {formData.timeSlots.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Available Schedule</span>
                      </div>
                      <div className="text-xs space-y-1">
                        {formData.timeSlots.slice(0, 3).map((slot) => (
                          <div key={slot.id} className="flex items-center justify-between py-1">
                            <span className="text-muted-foreground">{slot.day}</span>
                            <span className="font-medium">
                              {slot.from} - {slot.to}
                            </span>
                          </div>
                        ))}
                        {formData.timeSlots.length > 3 && (
                          <p className="text-muted-foreground text-center pt-1">
                            +{formData.timeSlots.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {formData.description && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Description</p>
                      <p className="text-sm line-clamp-4">{formData.description}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
