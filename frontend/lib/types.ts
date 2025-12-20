export interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ORGANIZATION";
  emailVerified: boolean;
  createdAt: string;
  updatedAt?: string;
  isMember?: boolean;
  organizationId?: string | null;
  organizationName?: string;
  organization?: Organization;
  adminOrganization?: Organization;
}

export interface Organization {
  id: string;
  name: string;
  location: string;
  businessHours?: BusinessHour[];
  description?: string;
  adminId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BusinessHour {
  day: string;
  from: string;
  to: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: "USER" | "ORGANIZATION";
}

export interface LoginData {
  email: string;
  password: string;
}

export interface Resource {
  id: string;
  name: string;
  capacity: number;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  bookType: "USER" | "RESOURCE";
  assignmentType: "AUTOMATIC" | "BY_VISITOR";
  allowMultipleSlots: boolean;
  maxSlotsPerBooking?: number; // Maximum continuous slots a user can book
  price?: number;
  isPaid?: boolean;
  location?: string;
  picture?: string;
  cancellationHours: number;
  schedule: any; // JSON
  questions: any; // JSON
  isPublished: boolean;
  secretLink?: string;
  expiryTime?: string;
  expiryCapacity?: number;
  bookingsCount: number;
  introMessage?: string;
  confirmationMessage?: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  organization?: Organization;
  allowedUsers?: User[];
  allowedResources?: Resource[];
}

export interface Booking {
  id: string;
  appointmentId: string;
  userId: string;
  resourceId?: string;
  assignedUserId?: string;
  startTime: string;
  endTime: string;
  numberOfSlots?: number; // Number of continuous slots booked
  userResponses?: any;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  bookingStatus: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  totalAmount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  appointment?: Appointment;
  user?: User;
  resource?: Resource;
  assignedUser?: User;
}

export interface TimeSlot {
  start?: string;
  end?: string;
  startTime?: string;
  endTime?: string;
  availableCount?: number; // Number of available spots in this slot
}
