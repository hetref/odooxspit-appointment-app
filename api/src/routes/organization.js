const express = require('express');
const requireAuth = require('../middlewares/requireAuth');
const prisma = require('../lib/prisma');
const { createAppointment, getOrganizationAppointments, getSingleAppointment } = require('../controllers/appointmentController');

const router = express.Router();

// All organization routes require authentication
router.use(requireAuth);

/**
 * Add member to organization (ADMIN only)
 */
router.post('/members', async (req, res) => {
    try {
        const userId = req.user.id;
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required.',
            });
        }

        // Fetch admin user with organization
        const adminUser = await prisma.user.findUnique({
            where: { id: userId },
            include: { adminOrganization: true },
        });

        // Check if user is organization admin
        if (!adminUser || adminUser.role !== 'ORGANIZATION' || adminUser.isMember) {
            return res.status(403).json({
                success: false,
                message: 'Only organization admins can add members.',
            });
        }

        if (!adminUser.adminOrganization) {
            return res.status(400).json({
                success: false,
                message: 'User does not have an organization.',
            });
        }

        const organizationId = adminUser.adminOrganization.id;

        // Find the user to add as member
        const memberUser = await prisma.user.findUnique({
            where: { email },
        });

        if (!memberUser) {
            return res.status(404).json({
                success: false,
                message: 'User with this email not found.',
            });
        }

        // Check if user is already a member or has own organization
        if (memberUser.role === 'ORGANIZATION') {
            return res.status(400).json({
                success: false,
                message: 'This user is already part of an organization.',
            });
        }

        // Update user to be a member
        const updatedUser = await prisma.user.update({
            where: { id: memberUser.id },
            data: {
                role: 'ORGANIZATION',
                isMember: true,
                organizationId: organizationId,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isMember: true,
            },
        });

        res.status(200).json({
            success: true,
            message: 'Member added successfully.',
            data: { member: updatedUser },
        });
    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while adding member.',
        });
    }
});

/**
 * Get organization members (ADMIN or MEMBER)
 */
router.get('/members', async (req, res) => {
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

        // Fetch all members including admin
        // Build conditions for members query
        const memberConditions = [
            { organizationId: organizationId, isMember: true },
        ];

        // Include admin only if current user is admin (not a member)
        if (!user.isMember) {
            memberConditions.push({ id: userId });
        }

        const members = await prisma.user.findMany({
            where: {
                OR: memberConditions,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isMember: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
        });

        res.status(200).json({
            success: true,
            data: { members },
        });
    } catch (error) {
        console.error('Get members error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching members.',
        });
    }
});

/**
 * Create resource (ADMIN only)
 */
router.post('/resources', async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, capacity } = req.body;

        if (!name || !capacity) {
            return res.status(400).json({
                success: false,
                message: 'Name and capacity are required.',
            });
        }

        if (capacity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Capacity must be greater than 0.',
            });
        }

        // Fetch admin user with organization
        const adminUser = await prisma.user.findUnique({
            where: { id: userId },
            include: { adminOrganization: true },
        });

        // Check if user is organization admin
        if (!adminUser || adminUser.role !== 'ORGANIZATION' || adminUser.isMember) {
            return res.status(403).json({
                success: false,
                message: 'Only organization admins can create resources.',
            });
        }

        if (!adminUser.adminOrganization) {
            return res.status(400).json({
                success: false,
                message: 'User does not have an organization.',
            });
        }

        const organizationId = adminUser.adminOrganization.id;

        // Create resource
        const resource = await prisma.resource.create({
            data: {
                name,
                capacity,
                organizationId,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Resource created successfully.',
            data: { resource },
        });
    } catch (error) {
        console.error('Create resource error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while creating resource.',
        });
    }
});

/**
 * Get organization resources (ADMIN or MEMBER)
 */
router.get('/resources', async (req, res) => {
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

        const resources = await prisma.resource.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({
            success: true,
            data: { resources },
        });
    } catch (error) {
        console.error('Get resources error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching resources.',
        });
    }
});

/**
 * Delete resource (ADMIN only)
 */
router.delete('/resources/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Fetch admin user with organization
        const adminUser = await prisma.user.findUnique({
            where: { id: userId },
            include: { adminOrganization: true },
        });

        // Check if user is organization admin
        if (!adminUser || adminUser.role !== 'ORGANIZATION' || adminUser.isMember) {
            return res.status(403).json({
                success: false,
                message: 'Only organization admins can delete resources.',
            });
        }

        if (!adminUser.adminOrganization) {
            return res.status(400).json({
                success: false,
                message: 'User does not have an organization.',
            });
        }

        const organizationId = adminUser.adminOrganization.id;

        // Verify resource belongs to organization
        const resource = await prisma.resource.findFirst({
            where: {
                id,
                organizationId,
            },
        });

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found.',
            });
        }

        // Delete resource
        await prisma.resource.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: 'Resource deleted successfully.',
        });
    } catch (error) {
        console.error('Delete resource error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while deleting resource.',
        });
    }
});

/**
 * Create appointment (ADMIN only)
 */
router.post('/appointments', createAppointment);

/**
 * Get organization appointments (ADMIN or MEMBER)
 */
router.get('/appointments', getOrganizationAppointments);

/**
 * Get single appointment (ADMIN or MEMBER)
 */
router.get('/appointments/:id', getSingleAppointment);

module.exports = router;
