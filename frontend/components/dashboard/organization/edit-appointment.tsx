"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    Save,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Clock,
    DollarSign,
    Plus,
    Trash2,
    MapPin,
} from "lucide-react";
import { organizationApi } from "@/lib/api";
import { authStorage } from "@/lib/auth";

interface TimeSlot {
    id: string;
    day: string;
    from: string;
    to: string;
}

interface Question {
    id: string;
    question: string;
    type: "text" | "textarea" | "radio" | "checkbox" | "select";
    required: boolean;
    options?: string[];
}

interface EditAppointmentProps {
    appointmentId: string;
    onBack?: () => void;
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function EditAppointment({ appointmentId, onBack }: EditAppointmentProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        durationMinutes: 30,
        location: "",
        isPaid: false,
        price: "",
        schedule: [] as TimeSlot[],
        questions: [] as Question[],
        introMessage: "",
        confirmationMessage: "",
        cancellationHours: 0,
    });

    useEffect(() => {
        fetchAppointment();
    }, [appointmentId]);

    const fetchAppointment = async () => {
        try {
            setIsLoading(true);
            const token = authStorage.getAccessToken();

            if (!token) {
                setError("Authentication required");
                return;
            }

            const response = await organizationApi.getAppointment(token, appointmentId);

            if (response.success && response.data) {
                const appointment = response.data.appointment;

                // Convert schedule from backend format
                const schedule = Array.isArray(appointment.schedule)
                    ? appointment.schedule.map((slot: any, index: number) => ({
                        id: `slot-${index}`,
                        day: slot.day.charAt(0) + slot.day.slice(1).toLowerCase(),
                        from: slot.from,
                        to: slot.to,
                    }))
                    : [];

                // Convert questions from backend format
                const questions = Array.isArray(appointment.questions)
                    ? appointment.questions.map((q: any, index: number) => ({
                        id: q.id || `q-${index}`,
                        question: q.question,
                        type: q.type.toLowerCase(),
                        required: q.required || false,
                        options: q.options || [],
                    }))
                    : [];

                setFormData({
                    title: appointment.title || "",
                    description: appointment.description || "",
                    durationMinutes: appointment.durationMinutes || 30,
                    location: appointment.location || "",
                    isPaid: appointment.isPaid || false,
                    price: appointment.price ? appointment.price.toString() : "",
                    schedule,
                    questions,
                    introMessage: appointment.introMessage || "",
                    confirmationMessage: appointment.confirmationMessage || "",
                    cancellationHours: appointment.cancellationHours || 0,
                });
            } else {
                setError("Failed to load appointment");
            }
        } catch (err: any) {
            console.error("Error fetching appointment:", err);
            setError(err.message || "Failed to load appointment");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        setError("");

        try {
            const token = authStorage.getAccessToken();

            if (!token) {
                setError("Authentication required");
                setIsSaving(false);
                return;
            }

            // Convert schedule to backend format (uppercase days)
            const schedule = formData.schedule.map((slot) => ({
                day: slot.day.toUpperCase(),
                from: slot.from,
                to: slot.to,
            }));

            // Convert questions to backend format
            const questions = formData.questions.map((q) => ({
                id: q.id,
                question: q.question,
                type: q.type.toUpperCase(),
                required: q.required,
                options: q.options || [],
            }));

            const updateData = {
                title: formData.title,
                description: formData.description || null,
                durationMinutes: formData.durationMinutes,
                location: formData.location || null,
                price: formData.isPaid && formData.price ? parseFloat(formData.price) : null,
                cancellationHours: formData.cancellationHours,
                schedule,
                questions,
                introMessage: formData.introMessage || null,
                confirmationMessage: formData.confirmationMessage || null,
            };

            const response = await organizationApi.updateAppointment(token, appointmentId, updateData);

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    if (onBack) onBack();
                    else router.push("/dashboard/org/appointments");
                }, 1500);
            } else {
                setError(response.message || "Failed to update appointment");
            }
        } catch (err: any) {
            console.error("Error updating appointment:", err);
            setError(err.message || "Failed to update appointment");
        } finally {
            setIsSaving(false);
        }
    };

    const addTimeSlot = () => {
        const newSlot: TimeSlot = {
            id: `slot-${Date.now()}`,
            day: "Monday",
            from: "09:00",
            to: "17:00",
        };
        setFormData({ ...formData, schedule: [...formData.schedule, newSlot] });
    };

    const removeTimeSlot = (id: string) => {
        setFormData({
            ...formData,
            schedule: formData.schedule.filter((slot) => slot.id !== id),
        });
    };

    const updateTimeSlot = (id: string, field: keyof TimeSlot, value: string) => {
        setFormData({
            ...formData,
            schedule: formData.schedule.map((slot) =>
                slot.id === id ? { ...slot, [field]: value } : slot
            ),
        });
    };

    const addQuestion = () => {
        const newQuestion: Question = {
            id: `q-${Date.now()}`,
            question: "",
            type: "text",
            required: false,
        };
        setFormData({ ...formData, questions: [...formData.questions, newQuestion] });
    };

    const updateQuestion = (id: string, field: keyof Question, value: any) => {
        setFormData({
            ...formData,
            questions: formData.questions.map((q) =>
                q.id === id ? { ...q, [field]: value } : q
            ),
        });
    };

    const removeQuestion = (id: string) => {
        setFormData({
            ...formData,
            questions: formData.questions.filter((q) => q.id !== id),
        });
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Loading appointment...</p>
                </div>
            </div>
        );
    }

    // Success state
    if (success) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
                <Card className="w-full max-w-2xl">
                    <CardContent className="p-12">
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold">Appointment Updated!</h2>
                                <p className="text-muted-foreground">
                                    Your changes have been saved successfully.
                                </p>
                            </div>
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
                <div className="flex items-center justify-between gap-4 p-4 container mx-auto max-w-5xl">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={onBack || (() => router.back())}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">Edit Appointment</h1>
                            <p className="text-sm text-muted-foreground">Update appointment details</p>
                        </div>
                    </div>
                    <Button onClick={handleSubmit} disabled={isSaving} className="gap-2">
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto max-w-5xl p-4 space-y-6">
                {/* Error Display */}
                {error && (
                    <Card className="border-destructive">
                        <CardContent className="p-4">
                            <div className="flex gap-2 text-destructive">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">{error}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Basic Details */}
                <Card>
                    <CardContent className="p-6 space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">
                                        Appointment Title <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g., Medical Consultation"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Describe what this appointment is about..."
                                        rows={4}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="duration">
                                            Duration (minutes) <span className="text-destructive">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="duration"
                                                type="number"
                                                value={formData.durationMinutes}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 30 })
                                                }
                                                className="pl-9"
                                                min="1"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="location"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                className="pl-9"
                                                placeholder="e.g., Room 101"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="isPaid"
                                            checked={formData.isPaid}
                                            onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                                            className="w-4 h-4"
                                        />
                                        <Label htmlFor="isPaid" className="cursor-pointer font-normal">
                                            This is a paid appointment
                                        </Label>
                                    </div>

                                    {formData.isPaid && (
                                        <div className="space-y-2">
                                            <Label htmlFor="price">Price</Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="price"
                                                    type="number"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                    className="pl-9"
                                                    placeholder="0.00"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Schedule */}
                <Card>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Availability Schedule</h3>
                            <Button onClick={addTimeSlot} variant="outline" size="sm" className="gap-2">
                                <Plus className="w-4 h-4" />
                                Add Time Slot
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {formData.schedule.map((slot) => (
                                <div key={slot.id} className="flex gap-3 items-start">
                                    <div className="flex-1 grid grid-cols-3 gap-3">
                                        <select
                                            value={slot.day}
                                            onChange={(e) => updateTimeSlot(slot.id, "day", e.target.value)}
                                            className="px-3 py-2 border rounded-md bg-background"
                                        >
                                            {daysOfWeek.map((day) => (
                                                <option key={day} value={day}>
                                                    {day}
                                                </option>
                                            ))}
                                        </select>
                                        <Input
                                            type="time"
                                            value={slot.from}
                                            onChange={(e) => updateTimeSlot(slot.id, "from", e.target.value)}
                                        />
                                        <Input
                                            type="time"
                                            value={slot.to}
                                            onChange={(e) => updateTimeSlot(slot.id, "to", e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeTimeSlot(slot.id)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}

                            {formData.schedule.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No time slots configured. Click "Add Time Slot" to create one.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Custom Questions */}
                <Card>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Custom Questions</h3>
                            <Button onClick={addQuestion} variant="outline" size="sm" className="gap-2">
                                <Plus className="w-4 h-4" />
                                Add Question
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {formData.questions.map((question, index) => (
                                <Card key={question.id} className="border">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="text-sm font-medium text-muted-foreground">
                                                Question {index + 1}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeQuestion(question.id)}
                                                className="text-destructive hover:text-destructive h-6 w-6 p-0"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>

                                        <Input
                                            value={question.question}
                                            onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                                            placeholder="Enter your question"
                                        />

                                        <div className="grid grid-cols-2 gap-3">
                                            <select
                                                value={question.type}
                                                onChange={(e) => updateQuestion(question.id, "type", e.target.value)}
                                                className="px-3 py-2 border rounded-md bg-background text-sm"
                                            >
                                                <option value="text">Short Text</option>
                                                <option value="textarea">Long Text</option>
                                                <option value="select">Dropdown</option>
                                                <option value="radio">Radio Buttons</option>
                                                <option value="checkbox">Checkboxes</option>
                                            </select>

                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id={`required-${question.id}`}
                                                    checked={question.required}
                                                    onChange={(e) => updateQuestion(question.id, "required", e.target.checked)}
                                                    className="w-4 h-4"
                                                />
                                                <Label htmlFor={`required-${question.id}`} className="text-sm font-normal cursor-pointer">
                                                    Required
                                                </Label>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {formData.questions.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No custom questions. Click "Add Question" to create one.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Messages */}
                <Card>
                    <CardContent className="p-6 space-y-6">
                        <h3 className="text-lg font-semibold">Custom Messages</h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="introMessage">Introduction Message</Label>
                                <Textarea
                                    id="introMessage"
                                    value={formData.introMessage}
                                    onChange={(e) => setFormData({ ...formData, introMessage: e.target.value })}
                                    placeholder="Message shown to visitors before booking..."
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmationMessage">Confirmation Message</Label>
                                <Textarea
                                    id="confirmationMessage"
                                    value={formData.confirmationMessage}
                                    onChange={(e) => setFormData({ ...formData, confirmationMessage: e.target.value })}
                                    placeholder="Message shown after successful booking..."
                                    rows={3}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Note about image */}
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
                    <CardContent className="p-4">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Note:</strong> Appointment images cannot be changed here. Please contact support if you need to update the appointment image.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
