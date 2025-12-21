# Bolna AI Integration - Technical Design

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  Settings Page    │  Voice Agents Page  │  Call History Page    │
│  - API Key Config │  - Agent List       │  - Call Logs          │
│  - Connection     │  - Create/Edit      │  - Filters            │
│    Status         │  - Test Agent       │  - Analytics          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend API (Express)                       │
├─────────────────────────────────────────────────────────────────┤
│  /bolna/api-key   │  /bolna/agents      │  /bolna/calls         │
│  - POST (save)    │  - CRUD operations  │  - POST (initiate)    │
│  - GET (status)   │  - Sync with Bolna  │  - GET (history)      │
│  - DELETE         │                     │  - Webhook handler    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Bolna API Service Layer                       │
├─────────────────────────────────────────────────────────────────┤
│  - API Key Encryption/Decryption                                │
│  - Bolna API Client (create agent, make call, etc.)             │
│  - Webhook Signature Validation                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      External Services                           │
├─────────────────────────────────────────────────────────────────┤
│  Bolna AI API (https://api.bolna.dev)                           │
│  - Agent Management                                              │
│  - Voice Calls                                                   │
│  - Webhooks                                                      │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
api/
├── src/
│   ├── controllers/
│   │   └── bolnaController.js      # All Bolna-related handlers
│   ├── routes/
│   │   └── bolna.js                # Bolna routes
│   ├── lib/
│   │   ├── bolnaClient.js          # Bolna API client
│   │   └── encryption.js           # API key encryption utilities
│   └── server.js                   # Add bolna routes

frontend/
├── app/(dashboard)/dashboard/org/
│   ├── voice-agents/
│   │   └── page.tsx                # Voice agents management
│   └── call-history/
│       └── page.tsx                # Call history & analytics
├── components/dashboard/organization/
│   ├── settings.tsx                # Add Voice Agent tab
│   ├── voice-agent-form.tsx        # Create/Edit agent form
│   └── call-dialog.tsx             # Make call dialog
└── lib/
    └── api.ts                      # Add bolnaApi functions
```

## Database Schema

### Prisma Schema Additions

```prisma
// Add to existing Organization model
model Organization {
  // ... existing fields
  bolnaApiKey        String?          // Encrypted
  bolnaAgents        BolnaAgent[]
  bolnaCalls         BolnaCall[]
}

model BolnaAgent {
  id                String   @id @default(cuid())
  organizationId    String
  bolnaAgentId      String   @unique  // ID returned from Bolna API
  name              String
  welcomeMessage    String   @db.Text
  instructions      String   @db.Text
  language          String   @default("en")
  voiceId           String?
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  organization      Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  calls             BolnaCall[]
  
  @@index([organizationId])
  @@index([bolnaAgentId])
}

model BolnaCall {
  id                String          @id @default(cuid())
  organizationId    String
  agentId           String
  bolnaCallId       String?         @unique  // ID returned from Bolna API
  recipientPhone    String
  status            BolnaCallStatus @default(INITIATED)
  duration          Int?            // Duration in seconds
  recordingUrl      String?
  transcript        String?         @db.Text
  errorMessage      String?
  metadata          Json?
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  completedAt       DateTime?
  
  organization      Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  agent             BolnaAgent   @relation(fields: [agentId], references: [id], onDelete: Cascade)
  
  @@index([organizationId])
  @@index([agentId])
  @@index([status])
  @@index([createdAt])
}

enum BolnaCallStatus {
  INITIATED
  RINGING
  IN_PROGRESS
  COMPLETED
  FAILED
  NO_ANSWER
  BUSY
  CANCELLED
}
```

## API Endpoints Design

### 1. API Key Management

#### POST /bolna/api-key
Save or update Bolna API key for organization.

**Request:**
```json
{
  "apiKey": "bolna_api_key_xxx"
}
```

**Response:**
```json
{
  "success": true,
  "message": "API key saved successfully",
  "data": {
    "isConnected": true,
    "validatedAt": "2025-12-21T10:00:00Z"
  }
}
```

#### GET /bolna/api-key/status
Check if API key is configured and valid.

**Response:**
```json
{
  "success": true,
  "data": {
    "isConfigured": true,
    "isValid": true,
    "lastValidated": "2025-12-21T10:00:00Z"
  }
}
```

### 2. Agent Management

#### POST /bolna/agents
Create a new voice agent.

**Request:**
```json
{
  "name": "Appointment Reminder",
  "welcomeMessage": "Hello! This is a reminder about your upcoming appointment.",
  "instructions": "You are a friendly appointment reminder assistant. Confirm the appointment details and ask if they need to reschedule.",
  "language": "en",
  "voiceId": "voice_xxx"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "agent": {
      "id": "cuid_xxx",
      "bolnaAgentId": "agent_xxx",
      "name": "Appointment Reminder",
      "welcomeMessage": "Hello!...",
      "instructions": "You are...",
      "language": "en",
      "isActive": true,
      "createdAt": "2025-12-21T10:00:00Z"
    }
  }
}
```

#### GET /bolna/agents
List all agents for the organization.

**Response:**
```json
{
  "success": true,
  "data": {
    "agents": [
      {
        "id": "cuid_xxx",
        "bolnaAgentId": "agent_xxx",
        "name": "Appointment Reminder",
        "language": "en",
        "isActive": true,
        "callCount": 45,
        "createdAt": "2025-12-21T10:00:00Z"
      }
    ]
  }
}
```

### 3. Call Management

#### POST /bolna/calls
Initiate a voice call.

**Request:**
```json
{
  "agentId": "cuid_xxx",
  "recipientPhone": "+919876543210"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "call": {
      "id": "cuid_xxx",
      "bolnaCallId": "call_xxx",
      "status": "INITIATED",
      "recipientPhone": "+919876543210",
      "createdAt": "2025-12-21T10:00:00Z"
    }
  }
}
```

#### GET /bolna/calls
Get call history with filters.

**Query Params:**
- `page` (default: 1)
- `limit` (default: 20)
- `agentId` (optional)
- `status` (optional)
- `startDate` (optional)
- `endDate` (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "calls": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    },
    "stats": {
      "totalCalls": 100,
      "completedCalls": 85,
      "failedCalls": 15,
      "avgDuration": 120
    }
  }
}
```

### 4. Webhook Handler

#### POST /bolna/webhook
Handle Bolna call status updates.

**Request (from Bolna):**
```json
{
  "event": "call.completed",
  "call_id": "call_xxx",
  "status": "completed",
  "duration": 180,
  "recording_url": "https://...",
  "transcript": "..."
}
```

## Encryption Implementation

### api/src/lib/encryption.js

```javascript
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey() {
  const key = process.env.BOLNA_ENCRYPTION_KEY;
  if (!key || key.length !== 32) {
    throw new Error('BOLNA_ENCRYPTION_KEY must be 32 characters');
  }
  return key;
}

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decrypt(encryptedText) {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

module.exports = { encrypt, decrypt };
```

## Bolna API Client

### api/src/lib/bolnaClient.js

```javascript
const BOLNA_API_BASE = 'https://api.bolna.dev';

class BolnaClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${BOLNA_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Bolna API error: ${response.status}`);
    }

    return response.json();
  }

  // Validate API key
  async validateKey() {
    try {
      await this.request('/v2/agent', { method: 'GET' });
      return true;
    } catch {
      return false;
    }
  }

  // Agent methods
  async createAgent(config) {
    return this.request('/v2/agent', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async getAgent(agentId) {
    return this.request(`/v2/agent/${agentId}`);
  }

  async updateAgent(agentId, config) {
    return this.request(`/v2/agent/${agentId}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async deleteAgent(agentId) {
    return this.request(`/v2/agent/${agentId}`, {
      method: 'DELETE',
    });
  }

  // Call methods
  async makeCall(agentId, recipientPhone, fromPhone) {
    return this.request('/call', {
      method: 'POST',
      body: JSON.stringify({
        agent_id: agentId,
        recipient_phone_number: recipientPhone,
        from_phone_number: fromPhone,
      }),
    });
  }

  async getCallStatus(callId) {
    return this.request(`/call/${callId}`);
  }
}

module.exports = BolnaClient;
```

## Frontend API Functions

### Addition to frontend/lib/api.ts

```typescript
// Bolna AI Voice Agent API
export const bolnaApi = {
  // API Key Management
  saveApiKey: (token: string, apiKey: string) =>
    api.post('/bolna/api-key', { apiKey }, token),

  getApiKeyStatus: (token: string) =>
    api.get('/bolna/api-key/status', token),

  deleteApiKey: (token: string) =>
    api.delete('/bolna/api-key', token),

  // Agent Management
  createAgent: (token: string, data: {
    name: string;
    welcomeMessage: string;
    instructions: string;
    language?: string;
    voiceId?: string;
  }) => api.post('/bolna/agents', data, token),

  getAgents: (token: string) =>
    api.get('/bolna/agents', token),

  getAgent: (token: string, agentId: string) =>
    api.get(`/bolna/agents/${agentId}`, token),

  updateAgent: (token: string, agentId: string, data: any) =>
    api.put(`/bolna/agents/${agentId}`, data, token),

  deleteAgent: (token: string, agentId: string) =>
    api.delete(`/bolna/agents/${agentId}`, token),

  // Call Management
  makeCall: (token: string, data: {
    agentId: string;
    recipientPhone: string;
  }) => api.post('/bolna/calls', data, token),

  getCalls: (token: string, params?: {
    page?: number;
    limit?: number;
    agentId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.agentId) queryParams.append('agentId', params.agentId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const endpoint = `/bolna/calls${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return api.get(endpoint, token);
  },

  getCall: (token: string, callId: string) =>
    api.get(`/bolna/calls/${callId}`, token),
};
```

## UI Components Design

### Settings Tab - Voice Agent Configuration

The Voice Agent tab in settings will include:
1. API Key input with show/hide toggle
2. Save/Update button
3. Connection status indicator
4. Link to Voice Agents management page

### Voice Agents Page

Features:
- List of agents in card format
- Create new agent button
- Each agent card shows: name, language, status, call count
- Actions: Edit, Delete, Test Call
- Agent form modal for create/edit

### Call History Page

Features:
- Table with columns: Date, Agent, Phone, Status, Duration, Actions
- Filters: Agent dropdown, Status dropdown, Date range
- Stats cards: Total Calls, Success Rate, Avg Duration
- Pagination
- View call details modal (transcript, recording)

## Security Measures

1. **API Key Security:**
   - Encrypted at rest using AES-256-GCM
   - Never sent to frontend after initial save
   - Only status (configured/valid) exposed

2. **Authorization:**
   - All endpoints require authentication
   - Organization admin only access
   - Verify organization ownership for all operations

3. **Input Validation:**
   - Phone number format validation (E.164)
   - Agent name/instructions length limits
   - Rate limiting on call endpoints

4. **Webhook Security:**
   - Validate Bolna webhook signatures
   - HTTPS only
   - Idempotency handling

## Error Handling

Common error scenarios:
- Invalid API key
- Bolna API rate limits
- Invalid phone number
- Agent not found
- Call failed
- Network errors

All errors return consistent format:
```json
{
  "success": false,
  "message": "Human-readable error message",
  "code": "ERROR_CODE"
}
```
