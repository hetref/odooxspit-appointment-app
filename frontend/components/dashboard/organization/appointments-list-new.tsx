"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Calendar,
    Clock,
    User,
    MapPin,
    Plus,
    Search,
    CheckCircle2,
    XCircle,
    AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { bookingApi } from "@/lib/api";
import { authStorage } from "@/lib/auth";

interface Booking {
    id: string;
    startTime: string;
    endTime: string;
    numberOfSlots: number;
    totalAmount: number;
    paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    bookingStatus: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
    createdAt: string;
    appointment: {
        id: string;
        title: string;
        durationMinutes: number;
    };
    user: {
        id: string;
        name: string;
        email: string;
    };
    resource?: {
        id: string;
        name: string;
    } | null;
    assignedUser?: {
        id: string;
        name: string;
    } | null;
}

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case "confirmed":
            return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
        case "pending":
            return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
        case "completed":
            return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
        case "cancelled":
            return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
        default:
            return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
};

const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case "paid":
            return "bg-green-500/10 text-green-700 dark:text-green-400";
        case "pending":
            return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
        case "refunded":
            return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
        case "failed":
            return "bg-red-500/10 text-red-700 dark:text-red-400";
        default:
            return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
};

export default function OrganizationAppointmentsList() {
    const router = useRouter();
    const [bookings, setBookings] = React.useState<Booking[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [error, setError] = React.useState("");

    React.useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const token = authStorage.getAccessToken();
            if (!token) {
                setError("Authentication required");
                setIsLoading(false);
                return;
            }

            const response = await bookingApi.getOrganizationBookings(token);
            if (response.success && response.data) {
                setBookings(response.data as Booking[]);
            } else {
                setError("Failed to load bookings");
            }
        } catch (err: any) {
            console.error("Failed to fetch bookings:", err);
            setError(err.message || "Failed to load bookings");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredBookings = bookings.filter((booking) =>
        booking.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.appointment.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: bookings.length,
        pending: bookings.filter((b) => b.bookingStatus === "PENDING").length,
        confirmed: bookings.filter((b) => b.bookingStatus === "CONFIRMED").length,
        completed: bookings.filter((b) => b.bookingStatus === "COMPLETED").length,
        revenue: bookings
            .filter((b) => b.paymentStatus === "PAID")
            .reduce((sum, b) => sum + b.totalAmount, 0),
    };

    if (isLoading) {
        return (
            <div className="p-8 space-y-6">
                <Skeleton className="h-12 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6 mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Booked Appointments</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage and track all customer bookings
                    </p>
                </div>
                <Button
                    size="lg"
                    className="gap-2 w-full sm:w-auto"
                    onClick={() => router.push("/dashboard/org/appointments/create")}
                >
                    <Plus className="w-5 h-5" />
                    Create Appointment
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                        <CardDescription>Total Bookings</CardDescription>
                        <CardTitle className="text-3xl font-bold">{stats.total}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>All time</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500">
                    <CardHeader className="pb-3">
                        <CardDescription>Pending</CardDescription>
                        <CardTitle className="text-3xl font-bold">{stats.pending}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                            <AlertCircle className="w-4 h-4" />
                            <span>Requires action</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-3">
                        <CardDescription>Confirmed</CardDescription>
                        <CardTitle className="text-3xl font-bold">{stats.confirmed}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Ready to go</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-3">
                        <CardDescription>Total Revenue</CardDescription>
                        <CardTitle className="text-3xl font-bold">${stats.revenue.toFixed(2)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>From paid bookings</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <CardHeader>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search bookings by customer name, email, or appointment..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardHeader>
            </Card>

            {/* Error */}
            {error && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                    </div>
                </div>
            )}

            {/* Bookings Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Appointment</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Provider/Resource</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Payment</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBookings.length > 0 ? (
                                    filteredBookings.map((booking) => (
                                        <TableRow key={booking.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{booking.user.name}</span>
                                                    <span className="text-sm text-muted-foreground">{booking.user.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{booking.appointment.title}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {booking.appointment.durationMinutes} min × {booking.numberOfSlots}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                                        <span className="text-sm">{format(new Date(booking.startTime), "MMM d, yyyy")}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                                        <span className="text-sm">{format(new Date(booking.startTime), "h:mm a")}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    {booking.assignedUser && (
                                                        <>
                                                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                                                            <span className="text-sm">{booking.assignedUser.name}</span>
                                                        </>
                                                    )}
                                                    {booking.resource && (
                                                        <>
                                                            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                                                            <span className="text-sm">{booking.resource.name}</span>
                                                        </>
                                                    )}
                                                    {!booking.assignedUser && !booking.resource && (
                                                        <span className="text-sm text-muted-foreground">N/A</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={getStatusColor(booking.bookingStatus)}
                                                    variant="outline"
                                                >
                                                    {booking.bookingStatus}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <Badge
                                                        className={getPaymentStatusColor(booking.paymentStatus)}
                                                        variant="secondary"
                                                    >
                                                        {booking.paymentStatus}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        ${booking.totalAmount.toFixed(2)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Calendar className="w-12 h-12" />
                                                <p>No bookings found</p>
                                                {searchQuery && (
                                                    <p className="text-sm">Try adjusting your search</p>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
