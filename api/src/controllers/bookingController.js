const prisma = require("../lib/prisma");
const crypto = require("crypto");

// Generate secret link for unpublished appointments
const generateSecretLink = () => {
    return crypto.randomBytes(16).toString("hex");
};

// Get published appointments (public)
const getPublishedAppointments = async (req, res) => {
    try {
        const { organizationId, search } = req.query;

        const where = {
            isPublished: true,
        };

        if (organizationId) {
            where.organizationId = organizationId;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ];
        }

        const appointments = await prisma.appointment.findMany({
            where,
            include: {
                organization: {
                    include: {
                        admin: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                allowedUsers: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                allowedResources: {
                    select: {
                        id: true,
                        name: true,
                        capacity: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.json({
            success: true,
            data: appointments,
        });
    } catch (error) {
        console.error("Error fetching published appointments:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch published appointments",
        });
    }
};

// Get appointment by ID or secret link (public with auth check)
const getAppointmentDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const { secretLink } = req.query;

        let appointment;

        if (secretLink) {
            // Access via secret link
            appointment = await prisma.appointment.findFirst({
                where: {
                    secretLink,
                },
                include: {
                    organization: {
                        include: {
                            admin: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    allowedUsers: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    allowedResources: {
                        select: {
                            id: true,
                            name: true,
                            capacity: true,
                        },
                    },
                },
            });

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: "Invalid or expired link",
                });
            }

            // Check expiry time
            if (appointment.expiryTime && new Date() > appointment.expiryTime) {
                return res.status(403).json({
                    success: false,
                    message: "This appointment link has expired",
                });
            }

            // Check expiry capacity
            if (
                appointment.expiryCapacity &&
                appointment.bookingsCount >= appointment.expiryCapacity
            ) {
                return res.status(403).json({
                    success: false,
                    message: "This appointment has reached its booking capacity",
                });
            }
        } else {
            // Access published appointment by ID
            appointment = await prisma.appointment.findUnique({
                where: { id },
                include: {
                    organization: {
                        include: {
                            admin: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                    allowedUsers: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    allowedResources: {
                        select: {
                            id: true,
                            name: true,
                            capacity: true,
                        },
                    },
                },
            });

            if (!appointment) {
                return res.status(404).json({
                    success: false,
                    message: "Appointment not found",
                });
            }

            if (!appointment.isPublished) {
                return res.status(403).json({
                    success: false,
                    message: "This appointment is not publicly available",
                });
            }
        }

        res.json({
            success: true,
            data: appointment,
        });
    } catch (error) {
        console.error("Error fetching appointment details:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch appointment details",
        });
    }
};

// Get available time slots for appointment
const getAvailableSlots = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, userId, resourceId } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Date is required",
            });
        }

        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                bookings: {
                    where: {
                        startTime: {
                            gte: new Date(date + "T00:00:00"),
                            lte: new Date(date + "T23:59:59"),
                        },
                        bookingStatus: {
                            in: ["PENDING", "CONFIRMED"],
                        },
                    },
                },
                allowedUsers: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                allowedResources: {
                    select: {
                        id: true,
                        name: true,
                        capacity: true,
                    },
                },
            },
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
        }

        // Get day of week from date
        const requestedDate = new Date(date);
        const dayOfWeek = requestedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
        const dayName = dayNames[dayOfWeek];

        // Find schedule for this day (schedule is stored as array: [{day: "MONDAY", from: "09:00", to: "17:00"}])
        const schedule = appointment.schedule;
        const daySchedule = Array.isArray(schedule)
            ? schedule.find(s => s.day === dayName)
            : null;

        if (!daySchedule) {
            return res.json({
                success: true,
                data: {
                    date,
                    dayOfWeek: dayName,
                    slots: [],
                    message: 'No appointments available on this day.',
                },
            });
        }

        const availableSlots = [];
        const slotDuration = appointment.durationMinutes;

        // Parse start and end times
        const [startHour, startMinute] = daySchedule.from.split(":").map(Number);
        const [endHour, endMinute] = daySchedule.to.split(":").map(Number);

        let currentMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;

        // Generate time slots
        while (currentMinutes + slotDuration <= endMinutes) {
            const slotHour = Math.floor(currentMinutes / 60);
            const slotMinute = currentMinutes % 60;

            const slotStart = new Date(date);
            slotStart.setHours(slotHour, slotMinute, 0, 0);

            const slotEnd = new Date(slotStart);
            slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

            // Check capacity for this slot
            let isAvailable = true;
            let availableCount = 0;

            if (appointment.bookType === "RESOURCE") {
                if (resourceId) {
                    // Check specific resource capacity
                    const resource = appointment.allowedResources.find(r => r.id === resourceId);
                    if (resource) {
                        const bookingsInSlot = appointment.bookings.filter((booking) => {
                            if (booking.resourceId !== resourceId) return false;

                            const bookingStart = new Date(booking.startTime);
                            const bookingEnd = new Date(booking.endTime);

                            // Check for time overlap
                            return (
                                (slotStart >= bookingStart && slotStart < bookingEnd) ||
                                (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
                                (slotStart <= bookingStart && slotEnd >= bookingEnd)
                            );
                        });

                        availableCount = resource.capacity - bookingsInSlot.length;
                        isAvailable = availableCount > 0;
                    }
                } else {
                    // Check overall resource availability
                    const totalCapacity = appointment.allowedResources.reduce((sum, r) => sum + r.capacity, 0);
                    const bookingsInSlot = appointment.bookings.filter((booking) => {
                        const bookingStart = new Date(booking.startTime);
                        const bookingEnd = new Date(booking.endTime);

                        return (
                            (slotStart >= bookingStart && slotStart < bookingEnd) ||
                            (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
                            (slotStart <= bookingStart && slotEnd >= bookingEnd)
                        );
                    });

                    availableCount = totalCapacity - bookingsInSlot.length;
                    isAvailable = availableCount > 0;
                }
            } else if (appointment.bookType === "USER") {
                if (userId) {
                    // Check if specific user is available (max 1 booking per user per slot)
                    const userBookingInSlot = appointment.bookings.find((booking) => {
                        if (booking.assignedUserId !== userId) return false;

                        const bookingStart = new Date(booking.startTime);
                        const bookingEnd = new Date(booking.endTime);

                        return (
                            (slotStart >= bookingStart && slotStart < bookingEnd) ||
                            (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
                            (slotStart <= bookingStart && slotEnd >= bookingEnd)
                        );
                    });

                    isAvailable = !userBookingInSlot;
                    availableCount = isAvailable ? 1 : 0;
                } else {
                    // Check overall user availability
                    const totalUsers = appointment.allowedUsers.length;
                    const bookingsInSlot = appointment.bookings.filter((booking) => {
                        const bookingStart = new Date(booking.startTime);
                        const bookingEnd = new Date(booking.endTime);

                        return (
                            (slotStart >= bookingStart && slotStart < bookingEnd) ||
                            (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
                            (slotStart <= bookingStart && slotEnd >= bookingEnd)
                        );
                    });

                    availableCount = totalUsers - bookingsInSlot.length;
                    isAvailable = availableCount > 0;
                }
            }

            if (isAvailable) {
                availableSlots.push({
                    startTime: slotStart.toISOString(),
                    endTime: slotEnd.toISOString(),
                    availableCount,
                });
            }

            // Move to next slot
            currentMinutes += slotDuration;
        }

        res.json({
            success: true,
            data: {
                date,
                dayOfWeek: dayName,
                slots: availableSlots,
            },
        });
    } catch (error) {
        console.error("Error fetching available slots:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch available slots",
        });
    }
};

// Create a booking
const createBooking = async (req, res) => {
    try {
        const { id: appointmentId } = req.params;
        const {
            startTime,
            resourceId,
            assignedUserId,
            userResponses,
            secretLink,
            numberOfSlots, // Number of continuous slots to book
        } = req.body;
        const userId = req.user.id;

        if (!startTime) {
            return res.status(400).json({
                success: false,
                message: "Start time is required",
            });
        }

        // Fetch appointment
        let appointment;
        if (secretLink) {
            appointment = await prisma.appointment.findFirst({
                where: { secretLink },
                include: {
                    allowedUsers: true,
                    allowedResources: true,
                    bookings: {
                        where: {
                            bookingStatus: {
                                in: ["PENDING", "CONFIRMED"],
                            },
                        },
                    },
                },
            });

            // Check expiry
            if (appointment && appointment.expiryTime && new Date() > appointment.expiryTime) {
                return res.status(403).json({
                    success: false,
                    message: "This appointment link has expired",
                });
            }

            if (
                appointment &&
                appointment.expiryCapacity &&
                appointment.bookingsCount >= appointment.expiryCapacity
            ) {
                return res.status(403).json({
                    success: false,
                    message: "This appointment has reached its booking capacity",
                });
            }
        } else {
            appointment = await prisma.appointment.findUnique({
                where: { id: appointmentId },
                include: {
                    allowedUsers: true,
                    allowedResources: true,
                    bookings: {
                        where: {
                            bookingStatus: {
                                in: ["PENDING", "CONFIRMED"],
                            },
                        },
                    },
                },
            });

            if (!appointment.isPublished) {
                return res.status(403).json({
                    success: false,
                    message: "This appointment is not available for booking",
                });
            }
        }

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found",
            });
        }

        // Validate number of slots
        const requestedSlots = numberOfSlots || 1;

        if (appointment.allowMultipleSlots) {
            if (appointment.maxSlotsPerBooking && requestedSlots > appointment.maxSlotsPerBooking) {
                return res.status(400).json({
                    success: false,
                    message: `Maximum ${appointment.maxSlotsPerBooking} continuous slots allowed per booking`,
                });
            }
        } else if (requestedSlots > 1) {
            return res.status(400).json({
                success: false,
                message: "Multiple slots per booking not allowed for this appointment",
            });
        }

        // Calculate end time based on number of slots
        const start = new Date(startTime);
        const end = new Date(start);
        const totalDuration = appointment.durationMinutes * requestedSlots;
        end.setMinutes(end.getMinutes() + totalDuration);

        // Check if all requested slots are available
        for (let i = 0; i < requestedSlots; i++) {
            const slotStart = new Date(start);
            slotStart.setMinutes(slotStart.getMinutes() + (i * appointment.durationMinutes));

            const slotEnd = new Date(slotStart);
            slotEnd.setMinutes(slotEnd.getMinutes() + appointment.durationMinutes);

            // Check capacity for this slot
            let hasCapacity = false;

            if (appointment.bookType === "RESOURCE") {
                if (!resourceId) {
                    return res.status(400).json({
                        success: false,
                        message: "Resource is required for this appointment",
                    });
                }

                const resource = appointment.allowedResources.find(r => r.id === resourceId);
                if (!resource) {
                    return res.status(400).json({
                        success: false,
                        message: "Invalid resource selected",
                    });
                }

                // Count bookings in this slot for this resource
                const bookingsInSlot = appointment.bookings.filter((booking) => {
                    if (booking.resourceId !== resourceId) return false;

                    const bookingStart = new Date(booking.startTime);
                    const bookingEnd = new Date(booking.endTime);

                    return (
                        (slotStart >= bookingStart && slotStart < bookingEnd) ||
                        (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
                        (slotStart <= bookingStart && slotEnd >= bookingEnd)
                    );
                });

                hasCapacity = bookingsInSlot.length < resource.capacity;

                if (!hasCapacity) {
                    return res.status(400).json({
                        success: false,
                        message: `Slot ${i + 1} is not available - resource capacity reached`,
                    });
                }
            } else if (appointment.bookType === "USER") {
                let selectedUserId = assignedUserId;

                // Auto-assign if automatic
                if (appointment.assignmentType === "AUTOMATIC" && !selectedUserId) {
                    const userBookingCounts = {};
                    appointment.allowedUsers.forEach((u) => {
                        userBookingCounts[u.id] = 0;
                    });

                    appointment.bookings.forEach((b) => {
                        if (b.assignedUserId && userBookingCounts[b.assignedUserId] !== undefined) {
                            userBookingCounts[b.assignedUserId]++;
                        }
                    });

                    // Find user with least bookings and available in this slot
                    for (const [uId, count] of Object.entries(userBookingCounts)) {
                        const userBookingInSlot = appointment.bookings.find((booking) => {
                            if (booking.assignedUserId !== uId) return false;

                            const bookingStart = new Date(booking.startTime);
                            const bookingEnd = new Date(booking.endTime);

                            return (
                                (slotStart >= bookingStart && slotStart < bookingEnd) ||
                                (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
                                (slotStart <= bookingStart && slotEnd >= bookingEnd)
                            );
                        });

                        if (!userBookingInSlot) {
                            selectedUserId = uId;
                            break;
                        }
                    }

                    if (!selectedUserId) {
                        return res.status(400).json({
                            success: false,
                            message: `Slot ${i + 1} is not available - no users available`,
                        });
                    }
                } else if (!selectedUserId) {
                    return res.status(400).json({
                        success: false,
                        message: "User assignment is required for this appointment",
                    });
                }

                // Check if selected user is available
                const userBookingInSlot = appointment.bookings.find((booking) => {
                    if (booking.assignedUserId !== selectedUserId) return false;

                    const bookingStart = new Date(booking.startTime);
                    const bookingEnd = new Date(booking.endTime);

                    return (
                        (slotStart >= bookingStart && slotStart < bookingEnd) ||
                        (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
                        (slotStart <= bookingStart && slotEnd >= bookingEnd)
                    );
                });

                if (userBookingInSlot) {
                    return res.status(400).json({
                        success: false,
                        message: `Slot ${i + 1} is not available for the selected user`,
                    });
                }

                // Update assignedUserId for the booking
                req.body.assignedUserId = selectedUserId;
                hasCapacity = true;
            }

            if (!hasCapacity) {
                return res.status(400).json({
                    success: false,
                    message: `Time slot ${i + 1} is already booked`,
                });
            }
        }

        // Calculate total amount (price * number of slots)
        const totalAmount = appointment.price ? appointment.price * requestedSlots : 0;

        // Create booking
        const booking = await prisma.booking.create({
            data: {
                appointmentId: appointment.id,
                userId,
                resourceId: resourceId || null,
                assignedUserId: req.body.assignedUserId || null,
                startTime: start,
                endTime: end,
                numberOfSlots: requestedSlots,
                userResponses: userResponses || null,
                totalAmount,
                paymentStatus: appointment.price ? "PENDING" : "PAID",
                bookingStatus: "CONFIRMED",
            },
            include: {
                appointment: {
                    include: {
                        organization: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                resource: true,
                assignedUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Increment bookings count
        await prisma.appointment.update({
            where: { id: appointment.id },
            data: {
                bookingsCount: {
                    increment: 1,
                },
            },
        });

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: booking,
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create booking",
        });
    }
};

// Get user's bookings
const getUserBookings = async (req, res) => {
    try {
        const userId = req.user.id;

        const bookings = await prisma.booking.findMany({
            where: { userId },
            include: {
                appointment: {
                    include: {
                        organization: true,
                    },
                },
                resource: true,
                assignedUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                startTime: "desc",
            },
        });

        res.json({
            success: true,
            data: bookings,
        });
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bookings",
        });
    }
};

// Get organization's bookings (for organization admin/members)
const getOrganizationBookings = async (req, res) => {
    try {
        const user = req.user;

        // Check if user is organization admin or member
        let organizationId;
        if (user.role === "ORGANIZATION") {
            const org = await prisma.organization.findUnique({
                where: { adminId: user.id },
            });
            if (!org) {
                return res.status(403).json({
                    success: false,
                    message: "Organization not found",
                });
            }
            organizationId = org.id;
        } else if (user.isMember && user.organizationId) {
            organizationId = user.organizationId;
        } else {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        const bookings = await prisma.booking.findMany({
            where: {
                appointment: {
                    organizationId,
                },
            },
            include: {
                appointment: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                resource: true,
                assignedUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                startTime: "desc",
            },
        });

        res.json({
            success: true,
            data: bookings,
        });
    } catch (error) {
        console.error("Error fetching organization bookings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bookings",
        });
    }
};

// Cancel booking (User)
const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const booking = await prisma.booking.findUnique({
            where: { id },
            include: {
                appointment: true,
            },
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Check if user owns the booking
        if (booking.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can only cancel your own bookings",
            });
        }

        // Check if already cancelled
        if (booking.bookingStatus === "CANCELLED") {
            return res.status(400).json({
                success: false,
                message: "Booking is already cancelled",
            });
        }

        // Check cancellation policy ONLY for PAID appointments
        if (booking.appointment.isPaid) {
            const now = new Date();
            const bookingStart = new Date(booking.startTime);
            const hoursUntilBooking =
                (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60);

            if (hoursUntilBooking < booking.appointment.cancellationHours) {
                return res.status(400).json({
                    success: false,
                    message: `Paid appointments can only be cancelled at least ${booking.appointment.cancellationHours} hours in advance`,
                });
            }
        }
        // Free appointments can be cancelled anytime

        // Update booking status
        await prisma.booking.update({
            where: { id },
            data: {
                bookingStatus: "CANCELLED",
            },
        });

        // Decrement bookings count
        await prisma.appointment.update({
            where: { id: booking.appointmentId },
            data: {
                bookingsCount: {
                    decrement: 1,
                },
            },
        });

        res.json({
            success: true,
            message: "Booking cancelled successfully",
        });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({
            success: false,
            message: "Failed to cancel booking",
        });
    }
};

// Cancel booking (Organization - no policy checks)
const cancelBookingByOrganization = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const booking = await prisma.booking.findUnique({
            where: { id },
            include: {
                appointment: {
                    include: {
                        organization: true,
                    },
                },
            },
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Check if user is organization admin or member
        let organizationId;
        if (user.role === "ORGANIZATION") {
            const org = await prisma.organization.findUnique({
                where: { adminId: user.id },
            });
            if (org) {
                organizationId = org.id;
            }
        } else if (user.isMember && user.organizationId) {
            organizationId = user.organizationId;
        }

        if (!organizationId || booking.appointment.organizationId !== organizationId) {
            return res.status(403).json({
                success: false,
                message: "You can only cancel bookings for your organization",
            });
        }

        // Check if already cancelled
        if (booking.bookingStatus === "CANCELLED") {
            return res.status(400).json({
                success: false,
                message: "Booking is already cancelled",
            });
        }

        // Organization can cancel immediately without policy checks
        await prisma.booking.update({
            where: { id },
            data: {
                bookingStatus: "CANCELLED",
            },
        });

        // Decrement bookings count
        await prisma.appointment.update({
            where: { id: booking.appointmentId },
            data: {
                bookingsCount: {
                    decrement: 1,
                },
            },
        });

        res.json({
            success: true,
            message: "Booking cancelled successfully by organization",
        });
    } catch (error) {
        console.error("Error cancelling booking by organization:", error);
        res.status(500).json({
            success: false,
            message: "Failed to cancel booking",
        });
    }
};

module.exports = {
    getPublishedAppointments,
    getAppointmentDetails,
    getAvailableSlots,
    createBooking,
    getUserBookings,
    getOrganizationBookings,
    cancelBooking,
    cancelBookingByOrganization,
    generateSecretLink,
};
