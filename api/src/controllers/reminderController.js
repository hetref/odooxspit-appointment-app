const prisma = require('../lib/prisma');

/**
 * Get all bookings that are scheduled to start in the next 6 hours
 * This endpoint is designed for n8n scheduler to send WhatsApp reminders
 */
async function getUpcomingBookings(req, res) {
    try {
        const now = new Date();
        const sixHoursLater = new Date(now.getTime() + 6 * 60 * 60 * 1000);

        // Get all confirmed bookings starting in the next 6 hours
        const bookings = await prisma.booking.findMany({
            where: {
                bookingStatus: 'CONFIRMED',
                startTime: {
                    gte: now,
                    lte: sixHoursLater,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                appointment: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        durationMinutes: true,
                    },
                },
                assignedUser: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                resource: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                startTime: 'asc',
            },
        });

        // Group bookings by user
        const userBookingsMap = {};

        bookings.forEach((booking) => {
            const userId = booking.user.id;

            if (!userBookingsMap[userId]) {
                userBookingsMap[userId] = {
                    user: {
                        id: booking.user.id,
                        name: booking.user.name,
                        email: booking.user.email,
                        phone: booking.user.phone,
                    },
                    bookings: [],
                };
            }

            userBookingsMap[userId].bookings.push({
                id: booking.id,
                appointmentTitle: booking.appointment.title,
                startTime: booking.startTime,
                endTime: booking.endTime,
                duration: booking.appointment.durationMinutes,
                assignedTo: booking.assignedUser?.name || booking.resource?.name || 'N/A',
            });
        });

        // Convert to array and format for WhatsApp
        const usersWithBookings = Object.values(userBookingsMap).map((userData) => {
            // Format appointments for WhatsApp message
            const appointmentsList = userData.bookings
                .map((booking, index) => {
                    const startTime = new Date(booking.startTime);
                    const endTime = new Date(booking.endTime);
                    const timeRange = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}-${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
                    
                    return `Appointment ${index + 1} - ${booking.appointmentTitle} [${timeRange}]`;
                })
                .join(', ');

            return {
                userId: userData.user.id,
                name: userData.user.name,
                email: userData.user.email,
                phone: userData.user.phone,
                bookingsCount: userData.bookings.length,
                appointments: userData.bookings,
                // Formatted message for WhatsApp template
                whatsappMessage: appointmentsList,
            };
        });

        res.json({
            success: true,
            message: `Found ${usersWithBookings.length} users with upcoming bookings`,
            data: {
                totalUsers: usersWithBookings.length,
                totalBookings: bookings.length,
                timeWindow: {
                    from: now.toISOString(),
                    to: sixHoursLater.toISOString(),
                },
                users: usersWithBookings,
            },
        });
    } catch (error) {
        console.error('Error fetching upcoming bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch upcoming bookings',
        });
    }
}

/**
 * Get bookings for a specific time window (flexible)
 * Query params: hoursAhead (default: 6)
 */
async function getBookingsInTimeWindow(req, res) {
    try {
        const hoursAhead = parseInt(req.query.hoursAhead) || 6;
        
        const now = new Date();
        const futureTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

        const bookings = await prisma.booking.findMany({
            where: {
                bookingStatus: 'CONFIRMED',
                startTime: {
                    gte: now,
                    lte: futureTime,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                appointment: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        durationMinutes: true,
                    },
                },
                assignedUser: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                resource: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                startTime: 'asc',
            },
        });

        // Group by user
        const userBookingsMap = {};

        bookings.forEach((booking) => {
            const userId = booking.user.id;

            if (!userBookingsMap[userId]) {
                userBookingsMap[userId] = {
                    user: {
                        id: booking.user.id,
                        name: booking.user.name,
                        email: booking.user.email,
                        phone: booking.user.phone,
                    },
                    bookings: [],
                };
            }

            userBookingsMap[userId].bookings.push({
                id: booking.id,
                appointmentTitle: booking.appointment.title,
                startTime: booking.startTime,
                endTime: booking.endTime,
                duration: booking.appointment.durationMinutes,
                assignedTo: booking.assignedUser?.name || booking.resource?.name || 'N/A',
            });
        });

        const usersWithBookings = Object.values(userBookingsMap).map((userData) => {
            const appointmentsList = userData.bookings
                .map((booking, index) => {
                    const startTime = new Date(booking.startTime);
                    const endTime = new Date(booking.endTime);
                    const timeRange = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}-${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
                    
                    return `Appointment ${index + 1} - ${booking.appointmentTitle} [${timeRange}]`;
                })
                .join(', ');

            return {
                userId: userData.user.id,
                name: userData.user.name,
                email: userData.user.email,
                phone: userData.user.phone,
                bookingsCount: userData.bookings.length,
                appointments: userData.bookings,
                whatsappMessage: appointmentsList,
            };
        });

        res.json({
            success: true,
            message: `Found ${usersWithBookings.length} users with bookings in the next ${hoursAhead} hours`,
            data: {
                totalUsers: usersWithBookings.length,
                totalBookings: bookings.length,
                hoursAhead,
                timeWindow: {
                    from: now.toISOString(),
                    to: futureTime.toISOString(),
                },
                users: usersWithBookings,
            },
        });
    } catch (error) {
        console.error('Error fetching bookings in time window:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
        });
    }
}

module.exports = {
    getUpcomingBookings,
    getBookingsInTimeWindow,
};
