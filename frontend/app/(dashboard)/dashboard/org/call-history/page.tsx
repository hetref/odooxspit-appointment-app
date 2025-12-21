"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  PhoneMissed,
  Clock,
  AlertCircle,
  CheckCircle2,
  Bot,
  ChevronLeft,
  ChevronRight,
  Download,
  Play,
} from "lucide-react";
import { bolnaApi } from "@/lib/api";
import { authStorage } from "@/lib/auth";

interface Call {
  id: string;
  bolnaCallId: string | null;
  recipientPhone: string;
  status: string;
  duration: number | null;
  recordingUrl: string | null;
  transcript: string | null;
  createdAt: string;
  completedAt: string | null;
  agent: { id: string; name: string };
}

interface Agent {
  id: string;
  name: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  INITIATED: { label: "Initiated", color: "bg-blue-100 text-blue-700", icon: Phone },
  RINGING: { label: "Ringing", color: "bg-yellow-100 text-yellow-700", icon: PhoneCall },
  IN_PROGRESS: { label: "In Progress", color: "bg-purple-100 text-purple-700", icon: PhoneCall },
  COMPLETED: { label: "Completed", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  FAILED: { label: "Failed", color: "bg-red-100 text-red-700", icon: PhoneOff },
  NO_ANSWER: { label: "No Answer", color: "bg-orange-100 text-orange-700", icon: PhoneMissed },
  BUSY: { label: "Busy", color: "bg-gray-100 text-gray-700", icon: PhoneOff },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-700", icon: PhoneOff },
};

export default function CallHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [calls, setCalls] = useState<Call[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Filters
  const [selectedAgent, setSelectedAgent] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalCalls: 0,
    completedCalls: 0,
    failedCalls: 0,
    avgDuration: 0,
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    fetchCalls();
  }, [page, selectedAgent, selectedStatus]);

  const fetchAgents = async () => {
    try {
      const accessToken = authStorage.getAccessToken();
      if (!accessToken) return;

      const response = await bolnaApi.getAgents(accessToken);
      if (response.success && response.data) {
        setAgents(response.data.agents);
      }
    } catch (err) {
      console.error("Error fetching agents:", err);
    }
  };

  const fetchCalls = async () => {
    try {
      setLoading(true);
      setError(null);

      const accessToken = authStorage.getAccessToken();
      if (!accessToken) {
        setError("Not authenticated");
        return;
      }

      const params: any = { page, limit: 20 };
      if (selectedAgent !== "all") params.agentId = selectedAgent;
      if (selectedStatus !== "all") params.status = selectedStatus;

      const response = await bolnaApi.getCalls(accessToken, params);

      if (response.success && response.data) {
        setCalls(response.data.calls);
        setTotalPages(response.data.pagination.totalPages);
        setStats(response.data.stats);
      } else {
        setError(response.message || "Failed to load calls");
      }
    } catch (err: any) {
      console.error("Error fetching calls:", err);
      setError(err.message || "Failed to load calls");
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportToCSV = () => {
    const headers = ["Date", "Agent", "Phone", "Status", "Duration"];
    const rows = calls.map((call) => [
      formatDate(call.createdAt),
      call.agent.name,
      call.recipientPhone,
      STATUS_CONFIG[call.status]?.label || call.status,
      formatDuration(call.duration),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `call-history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && calls.length === 0) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <PhoneCall className="h-8 w-8 text-rose-600" />
            Call History
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage all voice agent calls
          </p>
        </div>
        <Button variant="outline" onClick={exportToCSV} disabled={calls.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-100">
                <Phone className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCalls}</p>
                <p className="text-sm text-muted-foreground">Total Calls</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedCalls}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100">
                <PhoneOff className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.failedCalls}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatDuration(stats.avgDuration)}</p>
                <p className="text-sm text-muted-foreground">Avg Duration</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="w-48">
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="All Agents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-48">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calls Table */}
      <Card>
        <CardContent className="p-0">
          {calls.length === 0 ? (
            <div className="p-12 text-center">
              <PhoneCall className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Calls Yet</h3>
              <p className="text-muted-foreground mb-4">
                Make your first call using a voice agent
              </p>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/dashboard/org/voice-agents")}
              >
                <Bot className="h-4 w-4 mr-2" />
                Go to Voice Agents
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calls.map((call) => {
                    const statusConfig = STATUS_CONFIG[call.status] || {
                      label: call.status,
                      color: "bg-gray-100 text-gray-700",
                      icon: Phone,
                    };
                    const StatusIcon = statusConfig.icon;

                    return (
                      <TableRow key={call.id}>
                        <TableCell className="font-medium">
                          {formatDate(call.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-rose-600" />
                            {call.agent.name}
                          </div>
                        </TableCell>
                        <TableCell>{call.recipientPhone}</TableCell>
                        <TableCell>
                          <Badge className={statusConfig.color} variant="secondary">
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDuration(call.duration)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCall(call);
                              setShowDetailsDialog(true);
                            }}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Call Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Call Details</DialogTitle>
            <DialogDescription>
              Call to {selectedCall?.recipientPhone}
            </DialogDescription>
          </DialogHeader>
          {selectedCall && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Agent</p>
                  <p className="font-medium">{selectedCall.agent.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    className={STATUS_CONFIG[selectedCall.status]?.color}
                    variant="secondary"
                  >
                    {STATUS_CONFIG[selectedCall.status]?.label || selectedCall.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Started</p>
                  <p className="font-medium">{formatDate(selectedCall.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{formatDuration(selectedCall.duration)}</p>
                </div>
              </div>

              {selectedCall.recordingUrl && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Recording</p>
                  <audio controls className="w-full">
                    <source src={selectedCall.recordingUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              {selectedCall.transcript && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Transcript</p>
                  <div className="p-3 bg-muted rounded-lg text-sm max-h-48 overflow-y-auto">
                    {selectedCall.transcript}
                  </div>
                </div>
              )}

              {!selectedCall.recordingUrl && !selectedCall.transcript && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recording or transcript available for this call
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
