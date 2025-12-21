const BOLNA_API_BASE = 'https://api.bolna.dev';

class BolnaClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async request(endpoint, options = {}) {
        const url = `${BOLNA_API_BASE}${endpoint}`;
        
        console.log(`Bolna API Request: ${options.method || 'GET'} ${url}`);
        
        const response = await fetch(url, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        let data;
        try {
            data = await response.json();
        } catch (e) {
            data = {};
        }

        if (!response.ok) {
            console.error('Bolna API Error:', response.status, JSON.stringify(data));
            
            // Extract error message properly
            let errorMessage = `Bolna API error: ${response.status}`;
            if (data.detail) {
                errorMessage = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
            } else if (data.message) {
                errorMessage = typeof data.message === 'string' ? data.message : JSON.stringify(data.message);
            } else if (data.error) {
                errorMessage = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
            }
            
            const error = new Error(errorMessage);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    }

    // Validate API key - just check format, actual validation happens on first use
    async validateKey() {
        // Basic format check - Bolna API keys are typically non-empty strings
        if (!this.apiKey || typeof this.apiKey !== 'string' || this.apiKey.trim().length < 10) {
            console.error('Bolna API key validation failed: Invalid format');
            return false;
        }
        
        // Try to list agents to validate - but don't fail if endpoint differs
        try {
            // Try different possible endpoints
            const endpoints = ['/agent', '/agents', '/v1/agent', '/v1/agents'];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(`${BOLNA_API_BASE}${endpoint}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${this.apiKey}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    
                    // If we get 200 or even 404 (endpoint exists but no agents), key is valid
                    if (response.ok || response.status === 404) {
                        console.log(`Bolna API key validated via ${endpoint}`);
                        return true;
                    }
                    
                    // 401/403 means invalid key
                    if (response.status === 401 || response.status === 403) {
                        console.error('Bolna API key is invalid (unauthorized)');
                        return false;
                    }
                } catch (e) {
                    // Network error, try next endpoint
                    continue;
                }
            }
            
            // If we couldn't validate via API, accept the key if it looks valid
            // The actual validation will happen when creating agents/making calls
            console.log('Bolna API key accepted (format valid, API validation skipped)');
            return true;
        } catch (error) {
            console.error('Bolna API key validation error:', error.message);
            // Accept key anyway - validation will happen on actual use
            return true;
        }
    }

    // Create a new agent
    async createAgent(config) {
        const agentConfig = {
            agent_name: config.name,
            agent_welcome_message: config.welcomeMessage,
            agent_type: "other",
            webhook_url: config.webhookUrl || null,
            tasks: [
                {
                    task_type: "conversation",
                    toolchain: {
                        execution: "parallel",
                        pipelines: [["transcriber", "llm", "synthesizer"]]
                    },
                    tools_config: {
                        llm_agent: {
                            agent_flow_type: "streaming",
                            provider: "openai",
                            request_json: true,
                            model: "gpt-4o-mini",
                            max_tokens: 150,
                            temperature: 0.7,
                            family: "openai"
                        },
                        synthesizer: {
                            provider: "elevenlabs",
                            provider_config: {
                                voice: config.voiceId || "rachel",
                                model: "eleven_multilingual_v2"
                            },
                            stream: true
                        },
                        transcriber: {
                            provider: "deepgram",
                            stream: true,
                            language: config.language || "en",
                            model: "nova-2"
                        },
                        input: {
                            provider: "twilio",
                            format: "wav"
                        },
                        output: {
                            provider: "twilio",
                            format: "wav"
                        }
                    }
                }
            ],
            agent_prompts: {
                task_1: {
                    system_prompt: config.instructions
                }
            }
        };

        return this.request('/agent', {
            method: 'POST',
            body: JSON.stringify(agentConfig),
        });
    }

    // Get agent details
    async getAgent(agentId) {
        return this.request(`/agent/${agentId}`, { method: 'GET' });
    }

    // Update agent
    async updateAgent(agentId, config) {
        const updateConfig = {};
        
        if (config.name) updateConfig.agent_name = config.name;
        if (config.welcomeMessage) updateConfig.agent_welcome_message = config.welcomeMessage;
        if (config.instructions) {
            updateConfig.agent_prompts = {
                task_1: {
                    system_prompt: config.instructions
                }
            };
        }

        return this.request(`/agent/${agentId}`, {
            method: 'PUT',
            body: JSON.stringify(updateConfig),
        });
    }

    // Delete agent
    async deleteAgent(agentId) {
        return this.request(`/agent/${agentId}`, { method: 'DELETE' });
    }

    // Make a call
    async makeCall(agentId, recipientPhone, fromPhone) {
        return this.request('/call', {
            method: 'POST',
            body: JSON.stringify({
                agent_id: agentId,
                recipient_phone_number: recipientPhone,
                from_phone_number: fromPhone || undefined,
            }),
        });
    }

    // Get call status
    async getCallStatus(callId) {
        return this.request(`/call/${callId}`, { method: 'GET' });
    }
}

module.exports = BolnaClient;
