const express = require('express');
const router = express.Router();
const requireAuth = require('../middlewares/requireAuth');
const {
    saveApiKey,
    getApiKeyStatus,
    deleteApiKey,
    createAgent,
    getAgents,
    getAgent,
    updateAgent,
    deleteAgent,
    makeCall,
    getCalls,
    getCall,
    handleWebhook,
} = require('../controllers/bolnaController');

// Webhook endpoint (no auth - called by Bolna)
router.post('/webhook', handleWebhook);

// All other routes require authentication
router.use(requireAuth);

// API Key Management
router.post('/api-key', saveApiKey);
router.get('/api-key/status', getApiKeyStatus);
router.delete('/api-key', deleteApiKey);

// Agent Management
router.post('/agents', createAgent);
router.get('/agents', getAgents);
router.get('/agents/:agentId', getAgent);
router.put('/agents/:agentId', updateAgent);
router.delete('/agents/:agentId', deleteAgent);

// Call Management
router.post('/calls', makeCall);
router.get('/calls', getCalls);
router.get('/calls/:callId', getCall);

module.exports = router;
