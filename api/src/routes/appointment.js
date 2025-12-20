const express = require('express');
const {
    getPublicAppointments,
    getAvailableSlots,
    publishAppointment,
    unpublishAppointment,
    generateSecretLinkForAppointment,
    updateAppointment,
} = require('../controllers/appointmentController');
const requireAuth = require('../middlewares/requireAuth');

const router = express.Router();

/**
 * Get public appointments for an organization (NO AUTH)
 */
router.get('/public/organizations/:organizationId/appointments', getPublicAppointments);

/**
 * Get available slots for an appointment (NO AUTH)
 */
router.get('/public/appointments/:appointmentId/slots', getAvailableSlots);

/**
 * Publish appointment (ORGANIZATION admin only)
 */
router.post('/appointments/:id/publish', requireAuth, publishAppointment);

/**
 * Unpublish appointment (ORGANIZATION admin only)
 */
router.post('/appointments/:id/unpublish', requireAuth, unpublishAppointment);

/**
 * Generate secret link for appointment (ORGANIZATION admin only)
 */
router.post('/appointments/:id/secret-link', requireAuth, generateSecretLinkForAppointment);

/**
 * Update appointment (ORGANIZATION admin only)
 */
router.put('/appointments/:id', requireAuth, updateAppointment);

module.exports = router;
