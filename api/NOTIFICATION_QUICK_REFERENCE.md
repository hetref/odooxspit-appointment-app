# Notification System - Quick Reference

## 🚀 Quick Start

### Send a Single Notification (In-App + Email)
```javascript
const { createNotification } = require('./lib/notificationHelper');

await createNotification({
  userId: 'user_123',
  type: 'BOOKING_CONFIRMED',
  title: 'Booking Confirmed',
  message: 'Your booking has been confirmed.',
  actionUrl: '/dashboard/bookings',
  metadata: { bookingId: 'booking_456' },
  sendEmail: true, // Optional, defaults to true
});
```

### Notify All Organization Members (In-App + Email)
```javascript
const { notifyOrganizationMembers } = require('./lib/notificationHelper');

await notifyOrganizationMembers({
  organizationId: 'org_123',
  type: 'BOOKING_CREATED',
  title: 'New Booking',
  message: 'John Doe booked an appointment',
  actionUrl: '/dashboard/org/bookings',
  excludeUserId: 'admin_id', // Optional
  sendEmail: true, // Optional, defaults to true
});
```

### Send Bulk Notifications (In-App + Email)
```javascript
const { createBulkNotifications } = require('./lib/notificationHelper');

await createBulkNotifications([
  {
    userId: 'user_1',
    type: 'APPOINTMENT_CREATED',
    title: 'New Appointment',
    message: 'A new appointment is available',
  },
  {
    userId: 'user_2',
    type: 'APPOINTMENT_CREATED',
    title: 'New Appointment',
    message: 'A new appointment is available',
  },
], true); // sendEmail parameter
```

---

## 📋 Available Notification Types

```javascript
// Authentication
'EMAIL_VERIFIED'
'PASSWORD_CHANGED'

// Organization Management
'MEMBER_ADDED'
'MEMBER_REMOVED'
'RESOURCE_CREATED'
'RESOURCE_DELETED'
'ORGANIZATION_UPDATED'

// Appointments
'APPOINTMENT_CREATED'
'APPOINTMENT_UPDATED'
'APPOINTMENT_PUBLISHED'

// Bookings
'BOOKING_CREATED'
'BOOKING_CANCELLED'
'BOOKING_CONFIRMED'

// Future
'APPOINTMENT_CANCELLED'
'APPOINTMENT_REMINDER'
'BOOKING_REMINDER'
'BOOKING_REJECTED'
'PAYMENT_RECEIVED'
'PAYMENT_FAILED'
'INVITATION_RECEIVED'
'SYSTEM_ANNOUNCEMENT'
```

---

## 🔔 API Endpoints

### Get Notifications
```bash
GET /notifications?page=1&limit=20&read=false&type=BOOKING_CREATED
Authorization: Bearer YOUR_TOKEN
```

### Get Unread Count
```bash
GET /notifications/unread-count
Authorization: Bearer YOUR_TOKEN
```

### Mark as Read
```bash
PUT /notifications/:id/read
Authorization: Bearer YOUR_TOKEN
```

### Mark All as Read
```bash
PUT /notifications/mark-all-read
Authorization: Bearer YOUR_TOKEN
```

### Delete Notification
```bash
DELETE /notifications/:id
Authorization: Bearer YOUR_TOKEN
```

### Delete All Read
```bash
DELETE /notifications/read/all
Authorization: Bearer YOUR_TOKEN
```

---

## 📧 Email Configuration

### Required Environment Variables
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourapp.com
FROM_NAME=Your App Name
FRONTEND_URL=http://localhost:3000
```

### Disable Email for Specific Notification
```javascript
await createNotification({
  // ... notification data
  sendEmail: false, // Disable email, only in-app
});
```

---

## 🎨 Email Template Colors

| Type | Color | Icon | Emoji |
|------|-------|------|-------|
| BOOKING_CREATED | Green | 📅 | 🎉 |
| BOOKING_CANCELLED | Red | ❌ | ⚠️ |
| BOOKING_CONFIRMED | Blue | ✅ | ✓ |
| APPOINTMENT_CREATED | Purple | 📋 | ✨ |
| APPOINTMENT_UPDATED | Orange | 📝 | 🔄 |
| APPOINTMENT_PUBLISHED | Cyan | 🌐 | 🚀 |
| MEMBER_ADDED | Pink | 👥 | 👋 |
| MEMBER_REMOVED | Rose | 👤 | 👋 |
| RESOURCE_CREATED | Teal | 🏢 | ✨ |
| RESOURCE_DELETED | Orange | 🗑️ | 🗑️ |
| ORGANIZATION_UPDATED | Indigo | ⚙️ | 🔧 |
| EMAIL_VERIFIED | Green | ✉️ | ✓ |
| PASSWORD_CHANGED | Yellow | 🔒 | 🔐 |

---

## 🔧 Common Use Cases

### 1. Booking Created
```javascript
// In bookingController.js
await notifyOrganizationMembers({
  organizationId: booking.appointment.organization.id,
  type: 'BOOKING_CREATED',
  title: 'New Booking Received',
  message: `${userName} booked "${appointmentTitle}" for ${date}`,
  relatedId: booking.id,
  relatedType: 'booking',
  actionUrl: '/dashboard/org/bookings',
  metadata: { bookingId, appointmentTitle, userName, startTime, endTime },
});

// Also notify the visitor
await createNotification({
  userId: booking.userId,
  type: 'BOOKING_CONFIRMED',
  title: 'Booking Confirmed',
  message: `Your booking for "${appointmentTitle}" has been confirmed.`,
  relatedId: booking.id,
  relatedType: 'booking',
  actionUrl: '/dashboard/bookings',
});
```

### 2. Member Added
```javascript
// In organization.js routes
await createNotification({
  userId: newMember.id,
  type: 'MEMBER_ADDED',
  title: 'Welcome to Organization',
  message: `You have been added to ${organizationName}.`,
  relatedId: organizationId,
  relatedType: 'organization',
  actionUrl: '/dashboard/org/settings',
});

await notifyOrganizationMembers({
  organizationId,
  type: 'MEMBER_ADDED',
  title: 'New Member Added',
  message: `${memberName} has been added to the organization.`,
  relatedId: newMember.id,
  relatedType: 'user',
  actionUrl: '/dashboard/org/members',
  excludeUserId: newMember.id,
});
```

### 3. Appointment Published
```javascript
// In appointmentController.js
await notifyOrganizationMembers({
  organizationId: user.adminOrganization.id,
  type: 'APPOINTMENT_PUBLISHED',
  title: 'Appointment Published',
  message: `The appointment "${title}" is now publicly available.`,
  relatedId: appointment.id,
  relatedType: 'appointment',
  actionUrl: `/dashboard/org/appointments/${appointment.id}`,
  excludeUserId: userId,
});
```

---

## 🐛 Troubleshooting

### Email Not Sending
1. Check SMTP credentials in `.env`
2. Check console for error messages
3. Verify SMTP_USER and SMTP_PASS are set
4. Test with Gmail app password (not regular password)
5. Check if SMTP port is correct (587 for TLS, 465 for SSL)

### In-App Notification Not Showing
1. Check if notification was created in database
2. Verify userId is correct
3. Check API endpoint: `GET /notifications`
4. Verify authentication token is valid

### Email Sent But Not Received
1. Check spam/junk folder
2. Verify recipient email is correct
3. Check email service logs
4. Test with different email provider

---

## 📊 Response Examples

### Get Notifications Response
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notif_123",
        "type": "BOOKING_CREATED",
        "title": "New Booking Received",
        "message": "John Doe booked Dental Checkup",
        "read": false,
        "userId": "user_456",
        "relatedId": "booking_789",
        "relatedType": "booking",
        "actionUrl": "/dashboard/org/bookings",
        "metadata": { "bookingId": "booking_789" },
        "createdAt": "2024-12-20T14:30:00Z",
        "readAt": null
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    },
    "unreadCount": 12
  }
}
```

### Get Unread Count Response
```json
{
  "success": true,
  "data": {
    "unreadCount": 12
  }
}
```

---

## ✅ Best Practices

1. **Always include actionUrl** - Helps users navigate to relevant page
2. **Use meaningful titles** - Clear and concise
3. **Include context in message** - Who, what, when
4. **Add metadata** - Store additional data for frontend
5. **Use appropriate notification type** - Helps with filtering and styling
6. **Don't spam users** - Only send important notifications
7. **Test email templates** - Check appearance in different email clients
8. **Handle errors gracefully** - Email failures shouldn't break app
9. **Use excludeUserId** - Don't notify the user who triggered the action
10. **Keep messages short** - Users should understand at a glance

---

## 🚀 Quick Test

```bash
# Start server
cd api
node src/server.js

# Test notification endpoint
curl -X GET http://localhost:4000/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test unread count
curl -X GET http://localhost:4000/notifications/unread-count \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📚 Documentation Files

- `NOTIFICATION_IMPLEMENTATION_SUMMARY.md` - Complete implementation overview
- `BOOKING_NOTIFICATIONS_IMPLEMENTATION.md` - Booking-specific notifications
- `EMAIL_NOTIFICATIONS_IMPLEMENTATION.md` - Email notification details
- `COMPLETE_NOTIFICATION_SUMMARY.md` - Full system summary
- `NOTIFICATION_QUICK_REFERENCE.md` - This file

---

**Ready to use!** 🎉
