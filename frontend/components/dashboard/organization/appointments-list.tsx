"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Download,
  RefreshCw,
  CalendarCheck,
  CalendarX,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { GetUserData } from "@/lib/auth";
import { Label } from "@/components/ui/label";
import { bookingApi } from "@/lib/api";
import { authStorage } from "@/lib/auth";

// Types
interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  numberOfSlots: number;
  totalAmount: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  bookingStatus: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  userResponses: any;
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
    capacity: number;
  } | null;
  assignedUser?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface Stats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  revenue: number;
}

// Dummy Data
const dummyAppointments: Appointment[] = [
  {
    id: "1",
    appointmentType: "General Consultation",
    customerName: "Alice Johnson",
    customerEmail: "alice@example.com",
    date: "2025-01-15",
    time: "10:00 AM",
    duration: 30,
    venue: "Main Office - Room 101",
    provider: "Dr. Sarah Johnson",
    status: "pending",
    paymentStatus: "pending",
    paymentAmount: 50,
    capacityBooked: 1,
    createdAt: "2024-12-18T10:00:00Z",
  },
  {
    id: "2",
    appointmentType: "Technical Support",
    customerName: "Bob Smith",
    customerEmail: "bob@example.com",
    date: "2025-01-16",
    time: "2:30 PM",
    duration: 45,
    venue: "Support Center - Building B",
    provider: "John Smith",
    status: "confirmed",
    paymentStatus: "paid",
    paymentAmount: 75,
    capacityBooked: 1,
    confirmationMessage: "Looking forward to helping you with your technical issues.",
    createdAt: "2024-12-19T14:00:00Z",
  },
  {
    id: "3",
    appointmentType: "Product Demo",
    customerName: "Carol White",
    customerEmail: "carol@example.com",
    date: "2025-01-18",
    time: "11:00 AM",
    duration: 60,
    venue: "Demo Lab - Floor 3",
    provider: "Emily Chen",
    status: "confirmed",
    paymentStatus: "paid",
    paymentAmount: 100,
    capacityBooked: 2,
    createdAt: "2024-12-20T09:00:00Z",
  },
  {
    id: "4",
    appointmentType: "Training Session",
    customerName: "David Brown",
    customerEmail: "david@example.com",
    date: "2024-12-10",
    time: "9:00 AM",
    duration: 90,
    venue: "Training Center",
    provider: "Mark Wilson",
    status: "completed",
    paymentStatus: "paid",
    paymentAmount: 150,
    capacityBooked: 5,
    createdAt: "2024-11-28T10:00:00Z",
  },
  {
    id: "5",
    appointmentType: "General Consultation",
    customerName: "Eve Davis",
    customerEmail: "eve@example.com",
    date: "2024-11-25",
    time: "1:00 PM",
    duration: 30,
    venue: "Main Office - Room 101",
    provider: "Dr. Sarah Johnson",
    status: "completed",
    paymentStatus: "paid",
    paymentAmount: 50,
    capacityBooked: 1,
    createdAt: "2024-11-20T10:00:00Z",
  },
  {
    id: "6",
    appointmentType: "Technical Support",
    customerName: "Frank Miller",
    customerEmail: "frank@example.com",
    date: "2024-10-30",
    time: "10:30 AM",
    duration: 45,
    venue: "Support Center - Building B",
    provider: "John Smith",
    status: "cancelled",
    paymentStatus: "refunded",
    paymentAmount: 75,
    capacityBooked: 1,
    cancellationReason: "Customer requested to reschedule",
    createdAt: "2024-10-25T10:00:00Z",
  },
  {
    id: "7",
    appointmentType: "Follow-up Meeting",
    customerName: "Grace Lee",
    customerEmail: "grace@example.com",
    date: "2025-01-22",
    time: "3:00 PM",
    duration: 20,
    venue: "Conference Room A",
    provider: "Dr. Sarah Johnson",
    status: "pending",
    paymentStatus: "pending",
    paymentAmount: 40,
    capacityBooked: 1,
    createdAt: "2024-12-15T11:00:00Z",
  },
  {
    id: "8",
    appointmentType: "Strategy Planning",
    customerName: "Henry Taylor",
    customerEmail: "henry@example.com",
    date: "2025-01-25",
    time: "4:00 PM",
    duration: 120,
    venue: "Executive Board Room",
    provider: "Jennifer Adams",
    status: "confirmed",
    paymentStatus: "paid",
    paymentAmount: 200,
    capacityBooked: 1,
    createdAt: "2024-12-10T10:00:00Z",
  },
  {
    id: "9",
    appointmentType: "Product Demo",
    customerName: "Iris Martinez",
    customerEmail: "iris@example.com",
    date: "2024-12-05",
    time: "2:00 PM",
    duration: 60,
    venue: "Demo Lab - Floor 3",
    provider: "Emily Chen",
    status: "no_show",
    paymentStatus: "paid",
    paymentAmount: 100,
    capacityBooked: 1,
    createdAt: "2024-11-28T10:00:00Z",
  },
  {
    id: "10",
    appointmentType: "Training Session",
    customerName: "Jack Wilson",
    customerEmail: "jack@example.com",
    date: "2025-02-01",
    time: "10:00 AM",
    duration: 90,
    venue: "Training Center",
    provider: "Mark Wilson",
    status: "pending",
    paymentStatus: "pending",
    paymentAmount: 150,
    capacityBooked: 8,
    createdAt: "2024-12-18T10:00:00Z",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
    case "pending":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
    case "completed":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    case "cancelled":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
    case "no_show":
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    default:
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
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
  const [isLoading, setIsLoading] = React.useState(true);
  const [userData, setUserData] = React.useState<any>(null);
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterProvider, setFilterProvider] = React.useState("all");
  const [filterPaymentStatus, setFilterPaymentStatus] = React.useState("all");

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await GetUserData();
        setUserData(data);
        await fetchBookings();
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = authStorage.getAccessToken();
      if (!token) {
        console.error("No access token found");
        return;
      }

      const response = await bookingApi.getOrganizationBookings(token);
      if (response.success && response.data) {
        setBookings(response.data as Booking[]);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    }
  };

  // Calculate stats
  const stats: Stats = React.useMemo(() => {
    const statusMap = {
      PENDING: 'pending',
      CONFIRMED: 'confirmed',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled',
    };

    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.bookingStatus === "PENDING").length,
      confirmed: bookings.filter((b) => b.bookingStatus === "CONFIRMED").length,
      completed: bookings.filter((b) => b.bookingStatus === "COMPLETED").length,
      cancelled: bookings.filter((b) => b.bookingStatus === "CANCELLED").length,
      revenue: bookings
        .filter((b) => b.paymentStatus === "PAID")
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0),
    };
  }, [bookings]);

  // Filter bookings
  const filterBookings = (bookingsList: Booking[], status?: string) => {
    let filtered = status
      ? bookingsList.filter((b) => b.bookingStatus.toLowerCase() === status)
      : bookingsList;

    if (searchQuery) {
      filtered = filtered.filter(
        (b) =>
          b.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.appointment.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterProvider !== "all") {
      filtered = filtered.filter((b) =>
        b.assignedUser?.name === filterProvider ||
        b.resource?.name === filterProvider
      );
    }

    if (filterPaymentStatus !== "all") {
      filtered = filtered.filter((b) => b.paymentStatus.toLowerCase() === filterPaymentStatus);
    }

    return filtered;
  };

  const handleConfirm = async (bookingId: string) => {
    console.log("Confirming booking:", bookingId);
    // TODO: Implement confirm API call
    alert("Booking confirmed!");
    fetchBookings(); // Refresh
  };

  const handleCancel = async (bookingId: string) => {
    console.log("Cancelling booking:", bookingId);
    // TODO: Implement cancel API call  
    alert("Booking cancelled!");
    fetchBookings(); // Refresh
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsDialog(true);
  };

  const uniqueProviders = Array.from(new Set(
    bookings.map((b) => b.assignedUser?.name || b.resource?.name).filter(Boolean)
  )) as string[];

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
            Manage and track all your appointments
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
            <CardDescription>Total Appointments</CardDescription>
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
            <CardDescription>Pending Confirmation</CardDescription>
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
            <CardTitle className="text-3xl font-bold">${stats.revenue}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarCheck className="w-4 h-4" />
              <span>{stats.completed + stats.confirmed} paid bookings</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={filterProvider} onValueChange={setFilterProvider}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {uniqueProviders.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterPaymentStatus} onValueChange={setFilterPaymentStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="flex-1 sm:flex-none">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" className="flex-1 sm:flex-none">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Appointments Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-auto p-1 gap-1">
          <TabsTrigger value="all" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-2">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">All</span>
            <Badge variant="secondary" className="text-[10px] sm:text-xs h-4 sm:h-5 px-1 sm:px-1.5">
              {filterBookings(bookings).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-2">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Pending</span>
            <Badge variant="secondary" className="text-[10px] sm:text-xs h-4 sm:h-5 px-1 sm:px-1.5">
              {filterBookings(bookings, "pending").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-2">
            <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Confirmed</span>
            <Badge variant="secondary" className="text-[10px] sm:text-xs h-4 sm:h-5 px-1 sm:px-1.5">
              {filterBookings(bookings, "confirmed").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-2">
            <CalendarCheck className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Completed</span>
            <Badge variant="secondary" className="text-[10px] sm:text-xs h-4 sm:h-5 px-1 sm:px-1.5">
              {filterBookings(bookings, "completed").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-2">
            <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Cancelled</span>
            <Badge variant="secondary" className="text-[10px] sm:text-xs h-4 sm:h-5 px-1 sm:px-1.5">
              {filterBookings(bookings, "cancelled").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="no_show" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-2">
            <CalendarX className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">No Show</span>
            <Badge variant="secondary" className="text-[10px] sm:text-xs h-4 sm:h-5 px-1 sm:px-1.5">
              0
            </Badge>
          </TabsTrigger>
        </TabsList>

        {["all", "pending", "confirmed", "completed", "cancelled", "no_show"].map((tabValue) => {
          const filteredBookings = filterBookings(
            bookings,
            tabValue === "all" ? undefined : tabValue
          );

          return (
            <TabsContent key={tabValue} value={tabValue}>
              {/* Desktop Table View */}
              <Card className="hidden md:block">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Appointment Type</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Provider</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAppointments.length > 0 ? (
                          filteredAppointments.map((appointment) => (
                            <TableRow key={appointment.id}>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">{appointment.customerName}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {appointment.customerEmail}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">{appointment.appointmentType}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {appointment.duration} min
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="text-sm">{appointment.date}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span className="text-sm">{appointment.time}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span className="text-sm">{appointment.provider}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1.5 max-w-[200px]">
                                  <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                  <span className="text-sm truncate">{appointment.venue}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={getStatusColor(appointment.status)}
                                  variant="outline"
                                >
                                  {appointment.status.charAt(0).toUpperCase() +
                                    appointment.status.slice(1).replace("_", " ")}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <Badge
                                    className={getPaymentStatusColor(appointment.paymentStatus)}
                                    variant="secondary"
                                  >
                                    {appointment.paymentStatus.charAt(0).toUpperCase() +
                                      appointment.paymentStatus.slice(1)}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    ${appointment.paymentAmount}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleViewDetails(appointment)}
                                    >
                                      View Details
                                    </DropdownMenuItem>
                                    {appointment.status === "pending" && (
                                      <>
                                        <DropdownMenuItem
                                          onClick={() => handleConfirm(appointment.id)}
                                          className="text-green-600"
                                        >
                                          <CheckCircle2 className="w-4 h-4 mr-2" />
                                          Confirm
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleCancel(appointment.id)}
                                          className="text-red-600"
                                        >
                                          <XCircle className="w-4 h-4 mr-2" />
                                          Cancel
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    {appointment.status === "confirmed" && (
                                      <DropdownMenuItem>Reschedule</DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                                    <DropdownMenuItem>Contact Customer</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-12">
                              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <CalendarX className="w-12 h-12" />
                                <p>No appointments found</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <Card key={appointment.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-semibold truncate">
                              {appointment.customerName}
                            </CardTitle>
                            <CardDescription className="text-xs truncate">
                              {appointment.customerEmail}
                            </CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(appointment)}
                              >
                                View Details
                              </DropdownMenuItem>
                              {appointment.status === "pending" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleConfirm(appointment.id)}
                                    className="text-green-600"
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Confirm
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleCancel(appointment.id)}
                                    className="text-red-600"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancel
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 pt-0">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{appointment.appointmentType}</span>
                          <span className="text-muted-foreground">{appointment.duration} min</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{appointment.date}</span>
                          <Clock className="w-4 h-4 text-muted-foreground ml-2" />
                          <span>{appointment.time}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate">{appointment.provider}</span>
                        </div>

                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{appointment.venue}</span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex gap-2">
                            <Badge
                              className={getStatusColor(appointment.status)}
                              variant="outline"
                            >
                              {appointment.status.charAt(0).toUpperCase() +
                                appointment.status.slice(1).replace("_", " ")}
                            </Badge>
                            <Badge
                              className={getPaymentStatusColor(appointment.paymentStatus)}
                              variant="secondary"
                            >
                              ${appointment.paymentAmount}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="py-12">
                    <CardContent>
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <CalendarX className="w-12 h-12" />
                        <p>No appointments found</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              Complete information about this appointment
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Appointment ID
                  </Label>
                  <p className="text-sm font-mono">{selectedAppointment.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge className={getStatusColor(selectedAppointment.status)} variant="outline">
                    {selectedAppointment.status.charAt(0).toUpperCase() +
                      selectedAppointment.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                    <p className="text-sm">{selectedAppointment.customerName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-sm">{selectedAppointment.customerEmail}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Appointment Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                    <p className="text-sm">{selectedAppointment.appointmentType}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                    <p className="text-sm">{selectedAppointment.duration} minutes</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                    <p className="text-sm">{selectedAppointment.date}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Time</Label>
                    <p className="text-sm">{selectedAppointment.time}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Provider</Label>
                    <p className="text-sm">{selectedAppointment.provider}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Venue</Label>
                    <p className="text-sm">{selectedAppointment.venue}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Payment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Payment Status
                    </Label>
                    <Badge
                      className={getPaymentStatusColor(selectedAppointment.paymentStatus)}
                      variant="secondary"
                    >
                      {selectedAppointment.paymentStatus.charAt(0).toUpperCase() +
                        selectedAppointment.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                    <p className="text-sm font-semibold">${selectedAppointment.paymentAmount}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Capacity Booked
                    </Label>
                    <p className="text-sm">{selectedAppointment.capacityBooked} slot(s)</p>
                  </div>
                </div>
              </div>

              {selectedAppointment.confirmationMessage && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Confirmation Message
                  </Label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">
                    {selectedAppointment.confirmationMessage}
                  </p>
                </div>
              )}

              {selectedAppointment.cancellationReason && (
                <div className="border-t pt-4">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Cancellation Reason
                  </Label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">
                    {selectedAppointment.cancellationReason}
                  </p>
                </div>
              )}

              <div className="border-t pt-4 flex gap-2 justify-end">
                {selectedAppointment.status === "pending" && (
                  <>
                    <Button
                      onClick={() => handleConfirm(selectedAppointment.id)}
                      className="gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Appointment
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleCancel(selectedAppointment.id)}
                      className="gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel Appointment
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

