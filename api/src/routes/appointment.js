const express = require('express');
const { getPublicAppointments, getAvailableSlots } = require('../controllers/appointmentController');

const router = express.Router();

/**
 * Get public appointments for an organization (NO AUTH)
 */
router.get('/public/organizations/:organizationId/appointments', getPublicAppointments);

/**
 * Get available slots for an appointment (NO AUTH)
 */
router.get('/public/appointments/:appointmentId/slots', getAvailableSlots);

module.exports = router;
