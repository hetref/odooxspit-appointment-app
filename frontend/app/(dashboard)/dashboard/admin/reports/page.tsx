"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Building2,
  Activity,
} from "lucide-react";
import { authStorage } from "@/lib/auth";

interface ReportsData {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  averageBookingValue: number;
  peakHours: Array<{ hour: string; count: number }>;
  providerUtilization: Array<{ name: string; percentage: number }>;
  monthlyTrends: Array<{ month: string; appointments: number }>;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    fetchReports();
  }, [timeRange]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);

      const accessToken = authStorage.getAccessToken();
      if (!accessToken) {
        return;
      }

      // TODO: Replace with actual API call
      // const response = await adminApi.getReports(accessToken, timeRange);

      // Mock data
      setTimeout(() => {
        setReports({
          totalAppointments: 3456,
          completedAppointments: 2891,
          cancelledAppointments: 234,
          totalRevenue: 145890,
          averageBookingValue: 42.19,
          peakHours: [
            { hour: "9:00 AM", count: 145 },
            { hour: "10:00 AM", count: 289 },
            { hour: "11:00 AM", count: 312 },
            { hour: "2:00 PM", count: 267 },
            { hour: "3:00 PM", count: 198 },
            { hour: "4:00 PM", count: 156 },
          ],
          providerUtilization: [
            { name: "Smith Clinic", percentage: 92 },
            { name: "Williams Center", percentage: 87 },
            { name: "Johnson Medical", percentage: 78 },
            { name: "Brown Healthcare", percentage: 65 },
            { name: "Davis Practice", percentage: 54 },
          ],
          monthlyTrends: [
            { month: "Jul", appointments: 245 },
            { month: "Aug", appointments: 312 },
            { month: "Sep", appointments: 289 },
            { month: "Oct", appointments: 367 },
            { month: "Nov", appointments: 423 },
            { month: "Dec", appointments: 456 },
          ],
        });
        setIsLoading(false);
      }, 1000);
    } catch (err: any) {
      console.error("Fetch reports error:", err);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 xl:px-6 py-6 space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64 animate-pulse" />
            <Skeleton className="h-4 w-96 animate-pulse" />
          </div>
          <Skeleton className="h-10 w-32 animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-32 animate-pulse" />
                <Skeleton className="h-4 w-4 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2 animate-pulse" />
                <Skeleton className="h-3 w-28 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader>
                <Skeleton className="h-6 w-48 animate-pulse" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 xl:px-6 py-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Reports & Insights
          </h1>
          <p className="text-muted-foreground mt-1">
            Analytics and performance metrics
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reports?.totalAppointments.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All bookings in period
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reports?.completedAppointments.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {reports &&
                ((reports.completedAppointments / reports.totalAppointments) * 100).toFixed(
                  1
                )}
              % completion rate
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ${reports?.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Generated in period
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Booking Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${reports?.averageBookingValue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per appointment
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cancelled
            </CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {reports?.cancelledAppointments}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {reports &&
                ((reports.cancelledAppointments / reports.totalAppointments) * 100).toFixed(
                  1
                )}
              % cancellation rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Peak Booking Hours Chart */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Peak Booking Hours
            </CardTitle>
            <CardDescription>Busiest times for appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Bookings",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[300px]"
            >
              <BarChart data={reports?.peakHours}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[8, 8, 0, 0]}
                  className="transition-all duration-300"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Trends Chart */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Monthly Appointment Trends
            </CardTitle>
            <CardDescription>Appointment volumes over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                appointments: {
                  label: "Appointments",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[300px]"
            >
              <LineChart data={reports?.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="appointments"
                  stroke="var(--color-appointments)"
                  strokeWidth={3}
                  dot={{ fill: "var(--color-appointments)", r: 4 }}
                  activeDot={{ r: 6 }}
                  className="transition-all duration-300"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Provider Utilization */}
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Provider Utilization
          </CardTitle>
          <CardDescription>Performance metrics by organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports?.providerUtilization.map((provider, i) => (
              <div key={i} className="space-y-2 group">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{provider.name}</span>
                  <span className="text-muted-foreground font-mono">{provider.percentage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ease-out group-hover:scale-x-105 origin-left ${
                      provider.percentage >= 80
                        ? "bg-green-600"
                        : provider.percentage >= 60
                        ? "bg-blue-600"
                        : "bg-orange-600"
                    }`}
                    style={{ width: `${provider.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
