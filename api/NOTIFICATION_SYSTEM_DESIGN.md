# Notification System Design

## 📋 Notification Schema Model

```prisma
enum NotificationType {
  APPOINTMENT_CREATED
  APPOINTMENT_UPDATED
  APPOINTMENT_CANCELLED
  APPOINTMENT_REMINDER
  MEMBER_ADDED
  MEMBER_REMOVED
  RESOURCE_CREATED
  RESOURCE_DELETED
  ORGANIZATION_UPDATED
  INVITATION_RECEIVED
  BOOKING_CONFIRMED
  BOOKING_REJECTED
  PAYMENT_RECEIVED
  PAYMENT_FAILED
  SYSTEM_ANNOUNCEMENT
}

model Notification {
  id             String           @id @default(cuid())
  type           NotificationType
  title          String
  message        String
  read           Boolean          @default(false)
  userId         String
  relatedId      String?          // ID of related entity (appointment, resource, etc.)
  relatedType    String?          // Type of related entity (appointment, resource, etc.)
  actionUrl      String?          // URL to navigate when clicked
  metadata       Json?            // Additional data (appointment details, user info, etc.)
  createdAt      DateTime         @default(now())
  readAt         DateTime?
  user           User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, read])
  @@index([createdAt])
}
```

---

## 🔔 Notification Activities

### 1. **Appointment Management**

#### For Organization Admins/Members:
- ✅ **New Appointment Booking** - When a visitor books an appointment
  - Title: "New Appointment Booked"
  - Message: "[Visitor Name] booked [Appointment Type] for [Date & Time]"
  - Action: View appointment details

- ✅ **Appointment Cancelled** - When a visitor cancels
  - Title: "Appointment Cancelled"
  - Message: "[Visitor Name] cancelled [Appointment Type] scheduled for [Date & Time]"
  - Action: View cancelled appointments

- ✅ **Appointment Rescheduled** - When a visitor reschedules
  - Title: "Appointment Rescheduled"
  - Message: "[Visitor Name] rescheduled [Appointment Type] from [Old Time] to [New Time]"
  - Action: View updated appointment

- ✅ **Appointment Reminder** - 24 hours before appointment
  - Title: "Upcoming Appointment Reminder"
  - Message: "You have an appointment with [Visitor Name] tomorrow at [Time]"
  - Action: View appointment details

#### For Visitors (Future Enhancement):
- ✅ **Booking Confirmation** - After successful booking
- ✅ **Booking Reminder** - 24 hours before appointment
- ✅ **Booking Cancelled by Organization** - When org cancels

---

### 2. **Organization Member Management**

#### For New Members:
- ✅ **Invitation Received** - When added to organization
  - Title: "You've been added to [Organization Name]"
  - Message: "[Admin Name] added you as a member of [Organization Name]"
  - Action: View organization dashboard

#### For Organization Admins:
- ✅ **Member Joined** - When member accepts invitation
  - Title: "New Member Joined"
  - Message: "[Member Name] has joined your organization"
  - Action: View members list

- ✅ **Member Left** - When member leaves organization
  - Title: "Member Left Organization"
  - Message: "[Member Name] has left your organization"
  - Action: View members list

---

### 3. **Resource Management**

#### For Organization Members:
- ✅ **New Resource Created** - When admin creates a resource
  - Title: "New Resource Available"
  - Message: "[Admin Name] created a new resource: [Resource Name]"
  - Action: View resources

- ✅ **Resource Deleted** - When admin deletes a resource
  - Title: "Resource Removed"
  - Message: "[Resource Name] has been removed from your organization"
  - Action: View resources

- ✅ **Resource Capacity Updated** - When capacity changes
  - Title: "Resource Capacity Updated"
  - Message: "[Resource Name] capacity changed from [Old] to [New]"
  - Action: View resource details

---

### 4. **Organization Settings**

#### For All Organization Members:
- ✅ **Organization Details Updated** - When admin updates org info
  - Title: "Organization Updated"
  - Message: "[Admin Name] updated organization details"
  - Action: View organization settings

- ✅ **Business Hours Changed** - When admin updates business hours
  - Title: "Business Hours Updated"
  - Message: "Organization business hours have been updated"
  - Action: View organization settings

---

### 5. **Payment & Billing** (If Paid Appointments)

#### For Organization Admins:
- ✅ **Payment Received** - When visitor pays for appointment
  - Title: "Payment Received"
  - Message: "Received $[Amount] for [Appointment Type] from [Visitor Name]"
  - Action: View payment details

- ✅ **Payment Failed** - When payment fails
  - Title: "Payment Failed"
  - Message: "Payment of $[Amount] failed for [Appointment Type]"
  - Action: View appointment details

---

### 6. **System Notifications**

#### For All Users:
- ✅ **System Announcement** - Important updates
  - Title: "System Update"
  - Message: "New features available: [Feature List]"
  - Action: View changelog

- ✅ **Maintenance Notice** - Scheduled maintenance
  - Title: "Scheduled Maintenance"
  - Message: "System will be down for maintenance on [Date] at [Time]"
  - Action: View maintenance schedule

---

### 7. **User Account**

#### For Individual Users:
- ✅ **Profile Updated** - When user updates profile
  - Title: "Profile Updated Successfully"
  - Message: "Your profile information has been updated"
  - Action: View profile

- ✅ **Password Changed** - When password is changed
  - Title: "Password Changed"
  - Message: "Your password was changed successfully"
  - Action: View security settings

- ✅ **Email Verified** - When email is verified
  - Title: "Email Verified"
  - Message: "Your email has been verified successfully"
  - Action: View profile

---

## 📊 Notification Priority Levels

### High Priority (Red Badge)
- Appointment cancellations
- Payment failures
- Member removed from organization
- System critical announcements

### Medium Priority (Yellow Badge)
- New appointment bookings
- Appointment reminders (24h before)
- New member added
- Resource changes

### Low Priority (Blue Badge)
- Organization settings updates
- System announcements
- Profile updates
- Resource created

---

## 🎯 Notification Delivery Channels

### In-App Notifications (Primary)
- Real-time notification bell icon
- Notification dropdown with unread count
- Notification center page with filters
- Mark as read/unread functionality
- Delete notifications

### Email Notifications (Secondary)
- Configurable per notification type
- User preferences for email notifications
- Digest emails (daily/weekly summary)
- Instant emails for high-priority notifications

### Push Notifications (Future)
- Browser push notifications
- Mobile app push notifications (if mobile app exists)

---

## 🔧 Notification Features

### Core Features:
1. **Real-time Updates** - WebSocket/SSE for instant notifications
2. **Unread Count Badge** - Show count of unread notifications
3. **Mark as Read/Unread** - Toggle read status
4. **Bulk Actions** - Mark all as read, delete all read
5. **Filtering** - Filter by type, read/unread, date
6. **Pagination** - Load notifications in batches
7. **Search** - Search notifications by content
8. **Action Links** - Click to navigate to related entity
9. **Notification Preferences** - User settings for notification types
10. **Notification History** - Keep notifications for 30 days

### Advanced Features:
1. **Notification Grouping** - Group similar notifications
2. **Notification Scheduling** - Schedule notifications for future
3. **Notification Templates** - Reusable notification templates
4. **Notification Analytics** - Track notification engagement
5. **Notification Digest** - Daily/weekly summary emails

---

## 📈 Implementation Priority

### Phase 1 (MVP):
1. Notification schema and model
2. Basic CRUD endpoints
3. Appointment-related notifications
4. In-app notification bell
5. Mark as read functionality

### Phase 2:
1. Member management notifications
2. Resource management notifications
3. Email notifications
4. Notification preferences

### Phase 3:
1. Real-time updates (WebSocket)
2. Advanced filtering and search
3. Notification analytics
4. Push notifications

---

## 🗄️ Database Indexes

```prisma
@@index([userId])              // Fast lookup by user
@@index([userId, read])        // Filter unread notifications
@@index([createdAt])           // Sort by date
@@index([type])                // Filter by type
@@index([relatedId, relatedType]) // Find related notifications
```

---

## 📝 Example Notification Data

```json
{
  "id": "notif_123",
  "type": "APPOINTMENT_CREATED",
  "title": "New Appointment Booked",
  "message": "John Doe booked Dental Care for Dec 25, 2024 at 10:00 AM",
  "read": false,
  "userId": "user_456",
  "relatedId": "appt_789",
  "relatedType": "appointment",
  "actionUrl": "/dashboard/appointments/appt_789",
  "metadata": {
    "appointmentType": "Dental Care",
    "visitorName": "John Doe",
    "appointmentDate": "2024-12-25T10:00:00Z",
    "duration": 30,
    "location": "Clinic Room 1"
  },
  "createdAt": "2024-12-20T14:30:00Z",
  "readAt": null
}
```

---

## ✅ Success Metrics

1. **Notification Delivery Rate** - % of notifications successfully delivered
2. **Read Rate** - % of notifications read by users
3. **Click-through Rate** - % of notifications clicked
4. **Response Time** - Time to deliver notification after event
5. **User Engagement** - Active users checking notifications daily

---

**Status**: 📋 Design Complete - Ready for Implementation
