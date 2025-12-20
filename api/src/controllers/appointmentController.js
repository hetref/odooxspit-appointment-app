const prisma = require('../lib/prisma');

/**
 * Create appointment (ORGANIZATION admin only)
 */
async function createAppointment(req, res) {
    try {
        const userId = req.user.id;
        const {
            title,
            description,
            location,
            durationMinutes,
            bookType,
            assignmentType,
            allowMultipleSlots,
            isPaid,
            price,
            cancellationHours,
            schedule,
            questions,
            picture,
            introMessage,
            confirmationMessage,
            allowedUserIds,
            allowedResourceIds,
        } = req.body;

        // Fetch user with organization
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { adminOrganization: true },
        });

        // Check if user is organization admin
        if (!user || user.role !== 'ORGANIZATION' || user.isMember) {
            return res.status(403).json({
                success: false,
                message: 'Only organization admins can create appointments.',
            });
        }

        if (!user.adminOrganization) {
            return res.status(400).json({
                success: false,
                message: 'User does not have an organization.',
            });
        }

        const organizationId = user.adminOrganization.id;

        // Validations
        if (!title || !durationMinutes || !bookType || !assignmentType || !schedule || !questions) {
            return res.status(400).json({
                success: false,
                message: 'Title, durationMinutes, bookType, assignmentType, schedule, and questions are required.',
            });
        }

        if (durationMinutes <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Duration minutes must be greater than 0.',
            });
        }

        if (!['USER', 'RESOURCE'].includes(bookType)) {
            return res.status(400).json({
                success: false,
                message: 'Book type must be either USER or RESOURCE.',
            });
        }

        if (!['AUTOMATIC', 'BY_VISITOR'].includes(assignmentType)) {
            return res.status(400).json({
                success: false,
                message: 'Assignment type must be either AUTOMATIC or BY_VISITOR.',
            });
        }

        // Validate schedule structure
        if (!Array.isArray(schedule) || schedule.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Schedule must be a non-empty array.',
            });
        }

        // Get organization business hours
        const organization = await prisma.organization.findUnique({
            where: { id: organizationId },
        });

        // Validate schedule against business hours
        for (const slot of schedule) {
            if (!slot.day || !slot.from || !slot.to) {
                return res.status(400).json({
                    success: false,
                    message: 'Each schedule slot must have day, from, and to fields.',
                });
            }

            // Check start < end
            if (slot.from >= slot.to) {
                return res.status(400).json({
                    success: false,
                    message: `Schedule slot for ${slot.day}: start time must be before end time.`,
                });
            }

            // Check against business hours
            const businessHour = organization.businessHours.find((bh) => bh.day === slot.day);
            if (!businessHour) {
                return res.status(400).json({
                    success: false,
                    message: `No business hours defined for ${slot.day}.`,
                });
            }

            if (slot.from < businessHour.from || slot.to > businessHour.to) {
                return res.status(400).json({
                    success: false,
                    message: `Schedule for ${slot.day} must be within business hours (${businessHour.from} - ${businessHour.to}).`,
                });
            }
        }

        // Validate allowed users/resources based on bookType
        if (bookType === 'USER') {
            if (!allowedUserIds || !Array.isArray(allowedUserIds) || allowedUserIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Allowed users are required for USER book type.',
                });
            }

            // Verify all users are organization members
            const users = await prisma.user.findMany({
                where: {
                    id: { in: allowedUserIds },
                    role: 'ORGANIZATION',
                    organizationId: organizationId,
                },
            });

            if (users.length !== allowedUserIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'All allowed users must be members of your organization.',
                });
            }
        }

        if (bookType === 'RESOURCE') {
            if (!allowedResourceIds || !Array.isArray(allowedResourceIds) || allowedResourceIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Allowed resources are required for RESOURCE book type.',
                });
            }

            // Verify all resources belong to organization
            const resources = await prisma.resource.findMany({
                where: {
                    id: { in: allowedResourceIds },
                    organizationId: organizationId,
                },
            });

            if (resources.length !== allowedResourceIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'All allowed resources must belong to your organization.',
                });
            }
        }

        // Create appointment
        const appointment = await prisma.appointment.create({
            data: {
                title,
                description,
                location,
                durationMinutes,
                bookType,
                assignmentType,
                allowMultipleSlots: allowMultipleSlots || false,
                isPaid: isPaid || false,
                price,
                cancellationHours: cancellationHours || 0,
                schedule,
                questions,
                picture,
                introMessage,
                confirmationMessage,
                organizationId,
                allowedUsers: bookType === 'USER' ? { connect: allowedUserIds.map((id) => ({ id })) } : undefined,
                allowedResources:
                    bookType === 'RESOURCE' ? { connect: allowedResourceIds.map((id) => ({ id })) } : undefined,
            },
            include: {
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

        res.status(201).json({
            success: true,
            message: 'Appointment created successfully.',
            data: { appointment },
        });
    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while creating appointment.',
        });
    }
}

/**
 * Get organization appointments (ORGANIZATION admin/member only)
 */
async function getOrganizationAppointments(req, res) {
    try {
        const userId = req.user.id;

        // Fetch user with organization
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { organization: true, adminOrganization: true },
        });

        if (!user || user.role !== 'ORGANIZATION') {
            return res.status(403).json({
                success: false,
                message: 'Only organization users can access this endpoint.',
            });
        }

        const organizationId = user.isMember ? user.organizationId : user.adminOrganization?.id;

        if (!organizationId) {
            return res.status(400).json({
                success: false,
                message: 'User is not associated with any organization.',
            });
        }

        const appointments = await prisma.appointment.findMany({
            where: { organizationId },
            include: {
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
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({
            success: true,
            data: { appointments },
        });
    } catch (error) {
        console.error('Get organization appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching appointments.',
        });
    }
}

/**
 * Get single appointment (ORGANIZATION admin/member only)
 */
async function getSingleAppointment(req, res) {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Fetch user with organization
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { organization: true, adminOrganization: true },
        });

        if (!user || user.role !== 'ORGANIZATION') {
            return res.status(403).json({
                success: false,
                message: 'Only organization users can access this endpoint.',
            });
        }

        const organizationId = user.isMember ? user.organizationId : user.adminOrganization?.id;

        const appointment = await prisma.appointment.findFirst({
            where: {
                id,
                organizationId,
            },
            include: {
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
                message: 'Appointment not found.',
            });
        }

        res.status(200).json({
            success: true,
            data: { appointment },
        });
    } catch (error) {
        console.error('Get single appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching appointment.',
        });
    }
}

/**
 * Get public appointments for an organization (NO AUTH)
 */
async function getPublicAppointments(req, res) {
    try {
        const { organizationId } = req.params;

        // Verify organization exists
        const organization = await prisma.organization.findUnique({
            where: { id: organizationId },
        });

        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found.',
            });
        }

        // Return sanitized appointment data
        const appointments = await prisma.appointment.findMany({
            where: { organizationId },
            select: {
                id: true,
                title: true,
                description: true,
                durationMinutes: true,
                bookType: true,
                assignmentType: true,
                allowMultipleSlots: true,
                price: true,
                cancellationHours: true,
                schedule: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({
            success: true,
            data: {
                organization: {
                    id: organization.id,
                    name: organization.name,
                    location: organization.location,
                    description: organization.description,
                },
                appointments,
            },
        });
    } catch (error) {
        console.error('Get public appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching appointments.',
        });
    }
}

/**
 * Get available slots for an appointment (NO AUTH)
 */
async function getAvailableSlots(req, res) {
    try {
        const { appointmentId } = req.params;
        const { date } = req.query; // Expected format: YYYY-MM-DD

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date query parameter is required (format: YYYY-MM-DD).',
            });
        }

        // Fetch appointment with related data
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                organization: true,
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
                message: 'Appointment not found.',
            });
        }

        // Get day of week from date (parse as local date to avoid timezone issues)
        const [year, month, day] = date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const dayOfWeek = dayNames[dateObj.getDay()];

        // Find schedule for this day
        const daySchedule = appointment.schedule.find((s) => s.day === dayOfWeek);

        if (!daySchedule) {
            return res.status(200).json({
                success: true,
                data: {
                    date,
                    dayOfWeek,
                    slots: [],
                    message: 'No appointments available on this day.',
                },
            });
        }

        // Generate time slots
        const slots = [];
        const startTime = daySchedule.from; // e.g., "09:00"
        const endTime = daySchedule.to; // e.g., "17:00"
        const duration = appointment.durationMinutes;

        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        let currentMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;

        while (currentMinutes + duration <= endMinutes) {
            const slotHour = Math.floor(currentMinutes / 60);
            const slotMinute = currentMinutes % 60;
            const slotTime = `${String(slotHour).padStart(2, '0')}:${String(slotMinute).padStart(2, '0')}`;

            // Check availability based on bookType and assignmentType
            let availableResources = [];
            let availableUsers = [];

            if (appointment.bookType === 'RESOURCE') {
                availableResources = appointment.allowedResources.map((resource) => ({
                    id: resource.id,
                    name: resource.name,
                    capacity: resource.capacity,
                    available: true, // In real implementation, check against bookings
                }));
            } else if (appointment.bookType === 'USER') {
                availableUsers = appointment.allowedUsers.map((user) => ({
                    id: user.id,
                    name: user.name,
                    available: true, // In real implementation, check against bookings
                }));
            }

            const hasAvailability =
                (appointment.bookType === 'RESOURCE' && availableResources.length > 0) ||
                (appointment.bookType === 'USER' && availableUsers.length > 0);

            if (hasAvailability) {
                slots.push({
                    time: slotTime,
                    available: true,
                    ...(appointment.assignmentType === 'BY_VISITOR' && appointment.bookType === 'RESOURCE'
                        ? { resources: availableResources }
                        : {}),
                    ...(appointment.assignmentType === 'BY_VISITOR' && appointment.bookType === 'USER'
                        ? { users: availableUsers }
                        : {}),
                });
            }

            currentMinutes += duration;
        }

        res.status(200).json({
            success: true,
            data: {
                appointment: {
                    id: appointment.id,
                    title: appointment.title,
                    durationMinutes: appointment.durationMinutes,
                    price: appointment.price,
                    bookType: appointment.bookType,
                    assignmentType: appointment.assignmentType,
                },
                date,
                dayOfWeek,
                slots,
            },
        });
    } catch (error) {
        console.error('Get available slots error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching available slots.',
        });
    }
}

module.exports = {
    createAppointment,
    getOrganizationAppointments,
    getSingleAppointment,
    getPublicAppointments,
    getAvailableSlots,
};
