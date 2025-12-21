const prisma = require('../lib/prisma');
const { encrypt, decrypt } = require('../lib/encryption');
const BolnaClient = require('../lib/bolnaClient');

/**
 * Get organization for current user (admin only)
 */
async function getOrganization(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { adminOrganization: true },
    });

    if (!user || !user.adminOrganization) {
        return null;
    }

    return user.adminOrganization;
}

/**
 * Save or update Bolna API key
 */
async function saveApiKey(req, res) {
    try {
        const { apiKey } = req.body;

        if (!apiKey) {
            return res.status(400).json({
                success: false,
                message: 'API key is required',
            });
        }

        // Basic validation - check if it's a non-empty string with reasonable length
        if (typeof apiKey !== 'string' || apiKey.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: 'API key appears to be invalid (too short)',
            });
        }

        const org = await getOrganization(req.user.id);
        if (!org) {
            return res.status(403).json({
                success: false,
                message: 'Only organization admins can configure Bolna',
            });
        }

        // Try to validate the API key with Bolna (but be lenient)
        const client = new BolnaClient(apiKey.trim());
        const isValid = await client.validateKey();

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Bolna API key. Please check your key and try again.',
            });
        }

        // Encrypt and save
        const encryptedKey = encrypt(apiKey.trim());
        await prisma.organization.update({
            where: { id: org.id },
            data: { bolnaApiKey: encryptedKey },
        });

        res.json({
            success: true,
            message: 'API key saved successfully',
            data: {
                isConnected: true,
                validatedAt: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error('Save API key error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to save API key',
        });
    }
}

/**
 * Get API key status
 */
async function getApiKeyStatus(req, res) {
    try {
        const org = await getOrganization(req.user.id);
        if (!org) {
            return res.status(403).json({
                success: false,
                message: 'Only organization admins can access this',
            });
        }

        const isConfigured = !!org.bolnaApiKey;
        let isValid = false;

        if (isConfigured) {
            const apiKey = decrypt(org.bolnaApiKey);
            if (apiKey) {
                const client = new BolnaClient(apiKey);
                isValid = await client.validateKey();
            }
        }

        res.json({
            success: true,
            data: {
                isConfigured,
                isValid,
            },
        });
    } catch (error) {
        console.error('Get API key status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get API key status',
        });
    }
}

/**
 * Delete API key
 */
async function deleteApiKey(req, res) {
    try {
        const org = await getOrganization(req.user.id);
        if (!org) {
            return res.status(403).json({
                success: false,
                message: 'Only organization admins can access this',
            });
        }

        await prisma.organization.update({
            where: { id: org.id },
            data: { bolnaApiKey: null },
        });

        res.json({
            success: true,
            message: 'API key removed successfully',
        });
    } catch (error) {
        console.error('Delete API key error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete API key',
        });
    }
}

/**
 * Create a new voice agent
 */
async function createAgent(req, res) {
    try {
        const { name, welcomeMessage, instructions, language, voiceId } = req.body;

        if (!name || !welcomeMessage || !instructions) {
            return res.status(400).json({
                success: false,
                message: 'Name, welcome message, and instructions are required',
            });
        }

        const org = await getOrganization(req.user.id);
        if (!org || !org.bolnaApiKey) {
            return res.status(403).json({
                success: false,
                message: 'Bolna API key not configured',
            });
        }

        const apiKey = decrypt(org.bolnaApiKey);
        const client = new BolnaClient(apiKey);

        // Create agent in Bolna
        let bolnaResponse;
        try {
            bolnaResponse = await client.createAgent({
                name,
                welcomeMessage,
                instructions,
                language: language || 'en',
                voiceId,
            });
        } catch (bolnaError) {
            console.error('Bolna API error:', bolnaError);
            // Extract meaningful error message
            let errorMessage = 'Failed to create agent in Bolna';
            if (bolnaError.message) {
                errorMessage = bolnaError.message;
            }
            if (bolnaError.data) {
                if (typeof bolnaError.data === 'string') {
                    errorMessage = bolnaError.data;
                } else if (bolnaError.data.detail) {
                    errorMessage = bolnaError.data.detail;
                } else if (bolnaError.data.message) {
                    errorMessage = bolnaError.data.message;
                }
            }
            return res.status(400).json({
                success: false,
                message: errorMessage,
            });
        }

        // Extract agent ID from response
        const bolnaAgentId = bolnaResponse.agent_id || bolnaResponse.id || bolnaResponse.agent?.id;
        
        if (!bolnaAgentId) {
            console.error('Bolna response missing agent ID:', bolnaResponse);
            return res.status(500).json({
                success: false,
                message: 'Failed to get agent ID from Bolna response',
            });
        }

        // Save to database
        const agent = await prisma.bolnaAgent.create({
            data: {
                organizationId: org.id,
                bolnaAgentId: bolnaAgentId,
                name,
                welcomeMessage,
                instructions,
                language: language || 'en',
                voiceId,
            },
        });

        res.json({
            success: true,
            data: { agent },
        });
    } catch (error) {
        console.error('Create agent error:', error);
        // Ensure we return a string message, not an object
        const errorMessage = typeof error.message === 'string' 
            ? error.message 
            : JSON.stringify(error.message) || 'Failed to create agent';
        res.status(500).json({
            success: false,
            message: errorMessage,
        });
    }
}

/**
 * Get all agents for organization
 */
async function getAgents(req, res) {
    try {
        const org = await getOrganization(req.user.id);
        if (!org) {
            return res.status(403).json({
                success: false,
                message: 'Only organization admins can access this',
            });
        }

        const agents = await prisma.bolnaAgent.findMany({
            where: { organizationId: org.id },
            include: {
                _count: {
                    select: { calls: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const formattedAgents = agents.map(agent => ({
            ...agent,
            callCount: agent._count.calls,
            _count: undefined,
        }));

        res.json({
            success: true,
            data: { agents: formattedAgents },
        });
    } catch (error) {
        console.error('Get agents error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get agents',
        });
    }
}

/**
 * Get single agent
 */
async function getAgent(req, res) {
    try {
        const { agentId } = req.params;

        const org = await getOrganization(req.user.id);
        if (!org) {
            return res.status(403).json({
                success: false,
                message: 'Only organization admins can access this',
            });
        }

        const agent = await prisma.bolnaAgent.findFirst({
            where: {
                id: agentId,
                organizationId: org.id,
            },
            include: {
                _count: {
                    select: { calls: true },
                },
            },
        });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found',
            });
        }

        res.json({
            success: true,
            data: {
                agent: {
                    ...agent,
                    callCount: agent._count.calls,
                    _count: undefined,
                },
            },
        });
    } catch (error) {
        console.error('Get agent error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get agent',
        });
    }
}

/**
 * Update agent
 */
async function updateAgent(req, res) {
    try {
        const { agentId } = req.params;
        const { name, welcomeMessage, instructions, language, voiceId, isActive } = req.body;

        const org = await getOrganization(req.user.id);
        if (!org || !org.bolnaApiKey) {
            return res.status(403).json({
                success: false,
                message: 'Bolna API key not configured',
            });
        }

        const existingAgent = await prisma.bolnaAgent.findFirst({
            where: {
                id: agentId,
                organizationId: org.id,
            },
        });

        if (!existingAgent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found',
            });
        }

        // Update in Bolna
        const apiKey = decrypt(org.bolnaApiKey);
        const client = new BolnaClient(apiKey);

        try {
            await client.updateAgent(existingAgent.bolnaAgentId, {
                name,
                welcomeMessage,
                instructions,
            });
        } catch (bolnaError) {
            console.error('Bolna update error:', bolnaError);
            // Continue with local update even if Bolna fails
        }

        // Update in database
        const agent = await prisma.bolnaAgent.update({
            where: { id: agentId },
            data: {
                name: name || existingAgent.name,
                welcomeMessage: welcomeMessage || existingAgent.welcomeMessage,
                instructions: instructions || existingAgent.instructions,
                language: language || existingAgent.language,
                voiceId: voiceId !== undefined ? voiceId : existingAgent.voiceId,
                isActive: isActive !== undefined ? isActive : existingAgent.isActive,
            },
        });

        res.json({
            success: true,
            data: { agent },
        });
    } catch (error) {
        console.error('Update agent error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update agent',
        });
    }
}

/**
 * Delete agent
 */
async function deleteAgent(req, res) {
    try {
        const { agentId } = req.params;

        const org = await getOrganization(req.user.id);
        if (!org) {
            return res.status(403).json({
                success: false,
                message: 'Only organization admins can access this',
            });
        }

        const agent = await prisma.bolnaAgent.findFirst({
            where: {
                id: agentId,
                organizationId: org.id,
            },
        });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found',
            });
        }

        // Try to delete from Bolna
        if (org.bolnaApiKey) {
            try {
                const apiKey = decrypt(org.bolnaApiKey);
                const client = new BolnaClient(apiKey);
                await client.deleteAgent(agent.bolnaAgentId);
            } catch (bolnaError) {
                console.error('Bolna delete error:', bolnaError);
                // Continue with local delete
            }
        }

        // Delete from database (cascades to calls)
        await prisma.bolnaAgent.delete({
            where: { id: agentId },
        });

        res.json({
            success: true,
            message: 'Agent deleted successfully',
        });
    } catch (error) {
        console.error('Delete agent error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete agent',
        });
    }
}

/**
 * Make a call
 */
async function makeCall(req, res) {
    try {
        const { agentId, recipientPhone } = req.body;

        if (!agentId || !recipientPhone) {
            return res.status(400).json({
                success: false,
                message: 'Agent ID and recipient phone are required',
            });
        }

        // Validate phone number format (basic E.164 validation)
        const phoneRegex = /^\+[1-9]\d{6,14}$/;
        if (!phoneRegex.test(recipientPhone)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number format. Use E.164 format (e.g., +919876543210)',
            });
        }

        const org = await getOrganization(req.user.id);
        if (!org || !org.bolnaApiKey) {
            return res.status(403).json({
                success: false,
                message: 'Bolna API key not configured',
            });
        }

        const agent = await prisma.bolnaAgent.findFirst({
            where: {
                id: agentId,
                organizationId: org.id,
            },
        });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found',
            });
        }

        // Create call record first
        const call = await prisma.bolnaCall.create({
            data: {
                organizationId: org.id,
                agentId: agent.id,
                recipientPhone,
                status: 'INITIATED',
            },
        });

        // Make call via Bolna
        const apiKey = decrypt(org.bolnaApiKey);
        const client = new BolnaClient(apiKey);

        try {
            const bolnaResponse = await client.makeCall(agent.bolnaAgentId, recipientPhone);

            // Update call with Bolna call ID
            const updatedCall = await prisma.bolnaCall.update({
                where: { id: call.id },
                data: {
                    bolnaCallId: bolnaResponse.call_id || bolnaResponse.id,
                    status: 'RINGING',
                },
            });

            res.json({
                success: true,
                data: { call: updatedCall },
            });
        } catch (bolnaError) {
            // Update call as failed
            await prisma.bolnaCall.update({
                where: { id: call.id },
                data: {
                    status: 'FAILED',
                    errorMessage: bolnaError.message,
                },
            });

            throw bolnaError;
        }
    } catch (error) {
        console.error('Make call error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to make call',
        });
    }
}

/**
 * Get call history
 */
async function getCalls(req, res) {
    try {
        const { page = 1, limit = 20, agentId, status, startDate, endDate } = req.query;

        const org = await getOrganization(req.user.id);
        if (!org) {
            return res.status(403).json({
                success: false,
                message: 'Only organization admins can access this',
            });
        }

        const where = { organizationId: org.id };

        if (agentId) where.agentId = agentId;
        if (status) where.status = status;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [calls, total] = await Promise.all([
            prisma.bolnaCall.findMany({
                where,
                include: {
                    agent: {
                        select: { id: true, name: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.bolnaCall.count({ where }),
        ]);

        // Get stats
        const stats = await prisma.bolnaCall.groupBy({
            by: ['status'],
            where: { organizationId: org.id },
            _count: { id: true },
        });

        const avgDuration = await prisma.bolnaCall.aggregate({
            where: {
                organizationId: org.id,
                duration: { not: null },
            },
            _avg: { duration: true },
        });

        const statusCounts = {
            total: total,
            completed: 0,
            failed: 0,
        };
        stats.forEach(s => {
            if (s.status === 'COMPLETED') statusCounts.completed = s._count.id;
            if (s.status === 'FAILED') statusCounts.failed = s._count.id;
        });

        res.json({
            success: true,
            data: {
                calls,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
                stats: {
                    totalCalls: statusCounts.total,
                    completedCalls: statusCounts.completed,
                    failedCalls: statusCounts.failed,
                    avgDuration: Math.round(avgDuration._avg.duration || 0),
                },
            },
        });
    } catch (error) {
        console.error('Get calls error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get calls',
        });
    }
}

/**
 * Get single call
 */
async function getCall(req, res) {
    try {
        const { callId } = req.params;

        const org = await getOrganization(req.user.id);
        if (!org) {
            return res.status(403).json({
                success: false,
                message: 'Only organization admins can access this',
            });
        }

        const call = await prisma.bolnaCall.findFirst({
            where: {
                id: callId,
                organizationId: org.id,
            },
            include: {
                agent: {
                    select: { id: true, name: true },
                },
            },
        });

        if (!call) {
            return res.status(404).json({
                success: false,
                message: 'Call not found',
            });
        }

        // Try to get latest status from Bolna
        if (call.bolnaCallId && org.bolnaApiKey && call.status !== 'COMPLETED' && call.status !== 'FAILED') {
            try {
                const apiKey = decrypt(org.bolnaApiKey);
                const client = new BolnaClient(apiKey);
                const bolnaCall = await client.getCallStatus(call.bolnaCallId);

                // Update local record if status changed
                if (bolnaCall.status) {
                    const statusMap = {
                        'initiated': 'INITIATED',
                        'ringing': 'RINGING',
                        'in_progress': 'IN_PROGRESS',
                        'completed': 'COMPLETED',
                        'failed': 'FAILED',
                        'no_answer': 'NO_ANSWER',
                        'busy': 'BUSY',
                    };

                    const newStatus = statusMap[bolnaCall.status.toLowerCase()] || call.status;

                    if (newStatus !== call.status) {
                        const updatedCall = await prisma.bolnaCall.update({
                            where: { id: call.id },
                            data: {
                                status: newStatus,
                                duration: bolnaCall.duration || call.duration,
                                recordingUrl: bolnaCall.recording_url || call.recordingUrl,
                                transcript: bolnaCall.transcript || call.transcript,
                                completedAt: newStatus === 'COMPLETED' ? new Date() : call.completedAt,
                            },
                            include: {
                                agent: {
                                    select: { id: true, name: true },
                                },
                            },
                        });

                        return res.json({
                            success: true,
                            data: { call: updatedCall },
                        });
                    }
                }
            } catch (bolnaError) {
                console.error('Bolna status check error:', bolnaError);
            }
        }

        res.json({
            success: true,
            data: { call },
        });
    } catch (error) {
        console.error('Get call error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get call',
        });
    }
}

/**
 * Webhook handler for Bolna call updates
 */
async function handleWebhook(req, res) {
    try {
        const { event, call_id, status, duration, recording_url, transcript } = req.body;

        console.log('Bolna webhook received:', { event, call_id, status });

        if (!call_id) {
            return res.status(400).json({ success: false, message: 'Missing call_id' });
        }

        const call = await prisma.bolnaCall.findUnique({
            where: { bolnaCallId: call_id },
        });

        if (!call) {
            console.log('Call not found for webhook:', call_id);
            return res.status(200).json({ success: true, message: 'Call not found' });
        }

        const statusMap = {
            'initiated': 'INITIATED',
            'ringing': 'RINGING',
            'in_progress': 'IN_PROGRESS',
            'in-progress': 'IN_PROGRESS',
            'completed': 'COMPLETED',
            'failed': 'FAILED',
            'no_answer': 'NO_ANSWER',
            'no-answer': 'NO_ANSWER',
            'busy': 'BUSY',
            'cancelled': 'CANCELLED',
        };

        const newStatus = statusMap[status?.toLowerCase()] || call.status;

        await prisma.bolnaCall.update({
            where: { id: call.id },
            data: {
                status: newStatus,
                duration: duration || call.duration,
                recordingUrl: recording_url || call.recordingUrl,
                transcript: transcript || call.transcript,
                completedAt: ['COMPLETED', 'FAILED', 'NO_ANSWER', 'BUSY', 'CANCELLED'].includes(newStatus)
                    ? new Date()
                    : call.completedAt,
            },
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ success: false, message: 'Webhook processing failed' });
    }
}

module.exports = {
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
};
