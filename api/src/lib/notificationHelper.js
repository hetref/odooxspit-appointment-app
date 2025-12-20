const prisma = require('./prisma');

/**
 * Create a notification for a user
 */
async function createNotification({
  userId,
  type,
  title,
  message,
  relatedId = null,
  relatedType = null,
  actionUrl = null,
  metadata = null,
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        relatedId,
        relatedType,
        actionUrl,
        metadata,
      },
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

/**
 * Create notifications for multiple users
 */
async function createBulkNotifications(notifications) {
  try {
    const result = await prisma.notification.createMany({
      data: notifications,
    });
    return result;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    return null;
  }
}

/**
 * Notify all organization members
 */
async function notifyOrganizationMembers({
  organizationId,
  type,
  title,
  message,
  relatedId = null,
  relatedType = null,
  actionUrl = null,
  metadata = null,
  excludeUserId = null,
}) {
  try {
    // Get all organization members
    const members = await prisma.user.findMany({
      where: {
        OR: [
          { organizationId, isMember: true },
          {
            adminOrganization: {
              id: organizationId,
            },
          },
        ],
        ...(excludeUserId && { id: { not: excludeUserId } }),
      },
      select: { id: true },
    });

    if (members.length === 0) return null;

    // Create notifications for all members
    const notifications = members.map((member) => ({
      userId: member.id,
      type,
      title,
      message,
      relatedId,
      relatedType,
      actionUrl,
      metadata,
    }));

    return await createBulkNotifications(notifications);
  } catch (error) {
    console.error('Error notifying organization members:', error);
    return null;
  }
}

/**
 * Mark notification as read
 */
async function markAsRead(notificationId, userId) {
  try {
    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
    return notification.count > 0;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

/**
 * Mark all notifications as read for a user
 */
async function markAllAsRead(userId) {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
    return result.count;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return 0;
  }
}

/**
 * Delete old notifications (older than 30 days)
 */
async function deleteOldNotifications() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo,
        },
      },
    });
    return result.count;
  } catch (error) {
    console.error('Error deleting old notifications:', error);
    return 0;
  }
}

/**
 * Get unread count for a user
 */
async function getUnreadCount(userId) {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

module.exports = {
  createNotification,
  createBulkNotifications,
  notifyOrganizationMembers,
  markAsRead,
  markAllAsRead,
  deleteOldNotifications,
  getUnreadCount,
};
