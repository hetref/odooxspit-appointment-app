import { apiClient } from "./client";

export const bookingApi = {
  // Get published appointments (public)
  getPublishedAppointments: async (params?: {
    organizationId?: string;
    search?: string;
  }) => {
    const response = await apiClient.get("/appointments/published", { params });
    return response.data;
  },

  // Get appointment details (public with optional secret link)
  getAppointmentDetails: async (id: string, secretLink?: string) => {
    const params = secretLink ? { secretLink } : {};
    const response = await apiClient.get(`/appointments/${id}/details`, {
      params,
    });
    return response.data;
  },

  // Get available time slots
  getAvailableSlots: async (
    id: string,
    date: string,
    userId?: string,
    resourceId?: string
  ) => {
    const params: any = { date };
    if (userId) params.userId = userId;
    if (resourceId) params.resourceId = resourceId;

    const response = await apiClient.get(`/appointments/${id}/slots`, {
      params,
    });
    return response.data;
  },

  // Create a booking (requires auth)
  createBooking: async (
    appointmentId: string,
    bookingData: {
      startTime: string;
      resourceId?: string;
      assignedUserId?: string;
      userResponses?: any;
      secretLink?: string;
    }
  ) => {
    const response = await apiClient.post(
      `/appointments/${appointmentId}/book`,
      bookingData
    );
    return response.data;
  },

  // Get user's bookings (requires auth)
  getUserBookings: async () => {
    const response = await apiClient.get("/bookings/my");
    return response.data;
  },

  // Get organization bookings (requires auth - org admin/member)
  getOrganizationBookings: async () => {
    const response = await apiClient.get("/bookings/organization");
    return response.data;
  },

  // Cancel a booking (requires auth)
  cancelBooking: async (bookingId: string) => {
    const response = await apiClient.delete(`/bookings/${bookingId}`);
    return response.data;
  },
};
