# Notification System - Frontend Integration

## Overview
Complete integration of the notification system with the frontend, connecting to the backend API endpoints and providing real-time notification updates.

## Implementation Summary

### 1. Type Definitions (`frontend/lib/types.ts`)
Added notification types to match backend schema:

```typescript
export type NotificationType =
  | "APPOINTMENT_CREATED"
  | "APPOINTMENT_UPDATED"
  | "APPOINTMENT_PUBLISHED"
  | "BOOKING_CREATED"
  | "BOOKING_CONFIRMED"
  | "BOOKING_CANCELLED"
  | "MEMBER_ADDED"
  | "MEMBER_REMOVED"
  | "RESOURCE_CREATED"
  | "RESOURCE_DELETED"
  | "ORGANIZATION_UPDATED"
  | "EMAIL_VERIFIED"
  | "PASSWORD_CHANGED";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  readAt?: string;
  relatedId?: string;
  relatedType?: string;
  actionUrl?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}
```

### 2. API Methods (`frontend/lib/api.ts`)
Added complete notification API client:

```typescript
export const notificationApi = {
  // Get all notifications with pagination and filters
  getNotifications: (token, params?) => Promise<ApiResponse>
  
  // Get unread notification count
  getUnreadCount: (token) => Promise<ApiResponse>
  
  // Mark single notification as read
  markAsRead: (token, notificationId) => Promise<ApiResponse>
  
  // Mark all notifications as read
  markAllAsRead: (token) => Promise<ApiResponse>
  
  // Delete a notification
  deleteNotification: (token, notificationId) => Promise<ApiResponse>
  
  // Delete all read notifications
  deleteAllRead: (token) => Promise<ApiResponse>
}
```

### 3. Notification Dropdown (`frontend/components/dashboard/notification-dropdown.tsx`)
Updated to use real API instead of dummy data:

**Features:**
- Fetches latest 10 notifications when dropdown opens
- Polls for unread count every 30 seconds
- Shows unread badge on bell icon
- Click notification to mark as read
- Delete individual notifications
- Mark all as read button
- Navigate to full notifications page
- Loading state with spinner
- Empty state when no notifications

**API Integration:**
- `fetchNotifications()` - Loads notifications on dropdown open
- `fetchUnreadCount()` - Polls every 30 seconds for badge update
- `markAsRead()` - Marks notification as read
- `markAllAsRead()` - Marks all as read
- `deleteNotification()` - Deletes single notification

### 4. Notifications Page (`frontend/components/dashboard/notifications.tsx`)
Complete rewrite to use real API and differentiate between user types:

**Features:**
- Fetches all notifications on page load
- Shows different UI for organizers vs regular users
- Statistics cards (Total, Unread, Appointments/Bookings, Organization/Updates)
- Tabbed interface with filters:
  - All notifications
  - Unread only
  - Appointments (organizers) / Bookings (users)
  - Organization (organizers) / Updates (users)
  - Account notifications
- Mark as read functionality
- Mark all as read
- Delete individual notifications
- Delete all read notifications
- Loading and error states
- Empty state when no notifications

**User Type Differentiation:**
- **Organizers** (role === "ORGANIZATION" or isAdmin):
  - See "Appointments" tab
  - See "Organization" tab
  - Description: "Stay updated with your organization activities"
  
- **Regular Users**:
  - See "Bookings" tab
  - See "Updates" tab
  - Description: "Stay updated with your bookings and activities"

**Notification Categorization:**
- **Appointment/Booking**: Blue icon, includes APPOINTMENT_* and BOOKING_* types
- **Member/User**: Green icon, includes MEMBER_* types
- **Resource/Organization**: Purple icon, includes RESOURCE_* and ORGANIZATION_* types
- **Account**: Orange icon, includes EMAIL_* and PASSWORD_* types

### 5. API Endpoints Used

All endpoints are in `/api/src/routes/notification.js`:

```
GET    /notifications                    - Get all notifications (with pagination)
GET    /notifications/unread-count       - Get unread count
PUT    /notifications/:id/read           - Mark notification as read
PUT    /notifications/mark-all-read      - Mark all as read
DELETE /notifications/:id                - Delete notification
DELETE /notifications/read               - Delete all read notifications
```

## Features

### Real-Time Updates
- Dropdown polls for unread count every 30 seconds
- Badge updates automatically on bell icon
- Notifications refresh when dropdown opens

### User Experience
- Loading states with spinners
- Error handling with user-friendly messages
- Optimistic UI updates (local state updates immediately)
- Smooth animations and transitions
- Responsive design for mobile and desktop

### Notification Types Handled
All 13 notification types from backend:
1. APPOINTMENT_CREATED - When organizer creates appointment
2. APPOINTMENT_UPDATED - When appointment is modified
3. APPOINTMENT_PUBLISHED - When appointment is published
4. BOOKING_CREATED - When visitor books appointment
5. BOOKING_CONFIRMED - Confirmation sent to visitor
6. BOOKING_CANCELLED - When booking is cancelled
7. MEMBER_ADDED - When member joins organization
8. MEMBER_REMOVED - When member is removed
9. RESOURCE_CREATED - When resource is created
10. RESOURCE_DELETED - When resource is deleted
11. ORGANIZATION_UPDATED - When org settings change
12. EMAIL_VERIFIED - When email is verified
13. PASSWORD_CHANGED - When password is changed

## Testing Checklist

### Notification Dropdown
- [ ] Bell icon shows unread badge when there are unread notifications
- [ ] Clicking bell opens dropdown with notifications
- [ ] Unread count updates every 30 seconds
- [ ] Clicking unread notification marks it as read
- [ ] "Mark all read" button works
- [ ] Delete button (X) removes notification
- [ ] "View All Notifications" navigates to full page
- [ ] Loading spinner shows while fetching
- [ ] Empty state shows when no notifications

### Notifications Page
- [ ] Page loads all notifications on mount
- [ ] Statistics cards show correct counts
- [ ] Tabs filter notifications correctly
- [ ] Different tabs for organizers vs users
- [ ] Mark as read button works
- [ ] Mark all as read button works
- [ ] Delete button removes notification
- [ ] Clear read button removes all read notifications
- [ ] Unread notifications have blue border
- [ ] Icons and colors match notification types
- [ ] Loading state shows on initial load
- [ ] Error state shows if API fails

### Both Components
- [ ] Work for organization admins
- [ ] Work for organization members
- [ ] Work for regular users
- [ ] Handle authentication errors gracefully
- [ ] Update counts correctly after actions

## Files Modified

1. `frontend/lib/types.ts` - Added Notification type and NotificationType enum
2. `frontend/lib/api.ts` - Added notificationApi with 6 methods
3. `frontend/components/dashboard/notification-dropdown.tsx` - Integrated with API
4. `frontend/components/dashboard/notifications.tsx` - Complete rewrite with API integration

## Notes

- Both in-app and email notifications are sent from backend
- Email notifications are sent asynchronously (non-blocking)
- Notifications are automatically created by various controllers
- Old notifications (>30 days) can be cleaned up with helper function
- Pagination is supported but currently loading 100 notifications max
- Real-time updates use polling (30s interval), can be upgraded to WebSockets later

## Future Enhancements

1. **WebSocket Integration**: Replace polling with real-time WebSocket updates
2. **Push Notifications**: Add browser push notifications for important events
3. **Notification Preferences**: Let users configure which notifications they want
4. **Action Buttons**: Add quick action buttons in notifications (e.g., "View Booking")
5. **Notification Grouping**: Group similar notifications together
6. **Search/Filter**: Add search functionality in notifications page
7. **Infinite Scroll**: Load more notifications as user scrolls
8. **Sound/Visual Alerts**: Add sound or visual alerts for new notifications
