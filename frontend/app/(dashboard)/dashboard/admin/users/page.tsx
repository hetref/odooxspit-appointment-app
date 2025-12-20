"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Calendar,
  Building2,
  AlertCircle,
} from "lucide-react";
import { authStorage } from "@/lib/auth";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ORGANIZATION";
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  organization?: {
    name: string;
  };
  isMember?: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, roleFilter, statusFilter, users]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);

      const accessToken = authStorage.getAccessToken();
      if (!accessToken) {
        return;
      }

      // TODO: Replace with actual API call
      // const response = await adminApi.getUsers(accessToken);

      // Mock data
      setTimeout(() => {
        const mockUsers: UserData[] = [
          {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            role: "USER",
            emailVerified: true,
            isActive: true,
            createdAt: "2025-01-15T10:00:00Z",
          },
          {
            id: "2",
            name: "Jane Smith",
            email: "jane@example.com",
            role: "ORGANIZATION",
            emailVerified: true,
            isActive: true,
            createdAt: "2025-01-10T10:00:00Z",
            organization: { name: "Smith Clinic" },
          },
          {
            id: "3",
            name: "Bob Johnson",
            email: "bob@example.com",
            role: "USER",
            emailVerified: false,
            isActive: false,
            createdAt: "2025-01-20T10:00:00Z",
          },
          {
            id: "4",
            name: "Alice Williams",
            email: "alice@example.com",
            role: "ORGANIZATION",
            emailVerified: true,
            isActive: true,
            createdAt: "2025-01-05T10:00:00Z",
            organization: { name: "Williams Center" },
          },
          {
            id: "5",
            name: "Charlie Brown",
            email: "charlie@example.com",
            role: "USER",
            emailVerified: true,
            isActive: true,
            createdAt: "2025-01-12T10:00:00Z",
            isMember: true,
            organization: { name: "Smith Clinic" },
          },
        ];
        setUsers(mockUsers);
        setIsLoading(false);
      }, 1000);
    } catch (err: any) {
      console.error("Fetch users error:", err);
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) =>
        statusFilter === "active" ? user.isActive : !user.isActive
      );
    }

    setFilteredUsers(filtered);
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    // TODO: Implement API call to toggle user status
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, isActive: !currentStatus } : user
      )
    );
  };

  const viewUserDetails = (user: UserData) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="px-4 xl:px-6 py-6 space-y-6 animate-in fade-in duration-300">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 animate-pulse" />
          <Skeleton className="h-4 w-96 animate-pulse" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1 animate-pulse" />
          <Skeleton className="h-10 w-32 animate-pulse" />
          <Skeleton className="h-10 w-32 animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-20 animate-pulse" />
                <Skeleton className="h-8 w-16 animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
        <Card className="overflow-hidden">
          <div className="p-4">
            <Skeleton className="h-10 w-full animate-pulse" />
          </div>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="p-4 border-t">
              <Skeleton className="h-6 w-full animate-pulse" />
            </div>
          ))}
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 xl:px-6 py-6 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          User & Provider Management
        </h1>
        <p className="text-muted-foreground mt-1">
          View and manage all users and service providers
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="USER">Users</SelectItem>
            <SelectItem value="ORGANIZATION">Organizations</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Users className="h-4 w-4" />
            Total Users
          </div>
          <div className="text-2xl font-bold">{users.length}</div>
        </div>
        <div className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <UserCheck className="h-4 w-4" />
            Active
          </div>
          <div className="text-2xl font-bold text-green-600">
            {users.filter((u) => u.isActive).length}
          </div>
        </div>
        <div className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Building2 className="h-4 w-4" />
            Organizations
          </div>
          <div className="text-2xl font-bold">
            {users.filter((u) => u.role === "ORGANIZATION").length}
          </div>
        </div>
        <div className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <UserX className="h-4 w-4" />
            Inactive
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {users.filter((u) => !u.isActive).length}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No users found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-accent/50 transition-colors duration-150 cursor-pointer">
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.role === "ORGANIZATION"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }
                    >
                      {user.role === "ORGANIZATION" ? (
                        <Building2 className="h-3 w-3 mr-1" />
                      ) : (
                        <Users className="h-3 w-3 mr-1" />
                      )}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.organization ? (
                      <div>
                        <p className="text-sm">{user.organization.name}</p>
                        {user.isMember && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            Member
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.isActive ? "default" : "secondary"}
                      className={
                        user.isActive
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => viewUserDetails(user)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(user.id, user.isActive)}
                        >
                          {user.isActive ? (
                            <>
                              <UserX className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* User Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete information about this user
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Name
                  </label>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Role
                  </label>
                  <Badge variant="outline" className="mt-1">
                    {selectedUser.role}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <Badge
                    variant={selectedUser.isActive ? "default" : "secondary"}
                    className="mt-1"
                  >
                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email Verified
                  </label>
                  <p className="font-medium">
                    {selectedUser.emailVerified ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Joined Date
                  </label>
                  <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                </div>
              </div>
              {selectedUser.organization && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Organization
                  </label>
                  <p className="font-medium">{selectedUser.organization.name}</p>
                  {selectedUser.isMember && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      Member
                    </Badge>
                  )}
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  User ID
                </label>
                <p className="font-mono text-sm">{selectedUser.id}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
