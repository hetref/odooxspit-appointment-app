# Bolna AI Voice Agent Integration

## Overview
Integrate Bolna AI voice agent capabilities into the appointment booking platform, allowing organizations to create AI-powered voice agents that can make automated calls to customers for appointment reminders, confirmations, and follow-ups.

## User Stories

### US-1: API Key Management
**As an** organization admin  
**I want to** securely store my Bolna AI API key in settings  
**So that** I can enable voice agent features for my organization

**Acceptance Criteria:**
- [ ] Add "Voice Agent" tab in organization settings
- [ ] Input field for Bolna AI API key with show/hide toggle
- [ ] API key is encrypted before storing in database
- [ ] Validate API key by making a test call to Bolna API
- [ ] Show connection status (Connected/Not Connected)
- [ ] Allow updating or removing the API key

### US-2: Voice Agent Creation
**As an** organization admin  
**I want to** create voice agents with custom instructions  
**So that** I can automate calls for different purposes

**Acceptance Criteria:**
- [ ] Create new voice agent with:
  - Agent name
  - Welcome message
  - Agent instructions/prompt
  - Language selection (English, Hindi, etc.)
  - Voice selection (if available from Bolna)
- [ ] List all created agents with status
- [ ] Edit existing agents
- [ ] Delete agents
- [ ] Preview agent configuration before saving

### US-3: Voice Agent Testing
**As an** organization admin  
**I want to** preview/test my voice agent  
**So that** I can verify it works correctly before using it

**Acceptance Criteria:**
- [ ] "Test Agent" button for each agent
- [ ] Input phone number for test call
- [ ] Show call status in real-time
- [ ] Display call logs/history
- [ ] Audio playback of recorded calls (if available)

### US-4: Make Calls to Customers
**As an** organization admin  
**I want to** initiate voice calls to customers  
**So that** I can automate appointment reminders and confirmations

**Acceptance Criteria:**
- [ ] Select agent and recipient phone number
- [ ] Initiate call with one click
- [ ] Show call progress/status
- [ ] View call history with outcomes
- [ ] Bulk call feature for multiple recipients (future)

### US-5: Call History & Analytics
**As an** organization admin  
**I want to** view call history and analytics  
**So that** I can track the effectiveness of voice agents

**Acceptance Criteria:**
- [ ] List all calls with status, duration, timestamp
- [ ] Filter by agent, date range, status
- [ ] Basic analytics (total calls, success rate, avg duration)
- [ ] Export call logs

---

## Technical Requirements

### Database Schema Changes

```prisma
// Add to Organization model
model Organization {
  // ... existing fields
  bolnaApiKey        String?   // Encrypted API key
  bolnaAgents        BolnaAgent[]
  bolnaCalls         BolnaCall[]
}

model BolnaAgent {
  id                String   @id @default(cuid())
  organizationId    String
  bolnaAgentId      String   // ID from Bolna API
  name              String
  welcomeMessage    String
  instructions      String   @db.Text
  language          String   @default("en")
  voiceId           String?
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  organization      Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  calls             BolnaCall[]
  
  @@index([organizationId])
}

model BolnaCall {
  id                String   @id @default(cuid())
  organizationId    String
  agentId           String
  bolnaCallId       String?  // ID from Bolna API
  recipientPhone    String
  status            BolnaCallStatus @default(INITIATED)
  duration          Int?     // in seconds
  recordingUrl      String?
  transcript        String?  @db.Text
  metadata          Json?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  organization      Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  agent             BolnaAgent @relation(fields: [agentId], references: [id], onDelete: Cascade)
  
  @@index([organizationId])
  @@index([agentId])
}

enum BolnaCallStatus {
  INITIATED
  RINGING
  IN_PROGRESS
  COMPLETED
  FAILED
  NO_ANSWER
  BUSY
}
```

### API Endpoints

#### Backend Routes (`/api/bolna`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/bolna/api-key` | Save/update encrypted API key |
| GET | `/bolna/api-key/status` | Check if API key is configured and valid |
| DELETE | `/bolna/api-key` | Remove API key |
| POST | `/bolna/agents` | Create new voice agent |
| GET | `/bolna/agents` | List all agents for organization |
| GET | `/bolna/agents/:id` | Get agent details |
| PUT | `/bolna/agents/:id` | Update agent |
| DELETE | `/bolna/agents/:id` | Delete agent |
| POST | `/bolna/calls` | Initiate a call |
| GET | `/bolna/calls` | Get call history |
| GET | `/bolna/calls/:id` | Get call details |
| POST | `/bolna/webhook` | Webhook for Bolna call status updates |

### Bolna API Integration

Based on Bolna AI documentation:

**Authentication:**
- Bearer token in Authorization header
- Base URL: `https://api.bolna.dev`

**Key Endpoints:**
- `POST /v2/agent` - Create agent
- `GET /v2/agent/{agent_id}` - Get agent
- `PUT /v2/agent/{agent_id}` - Update agent
- `DELETE /v2/agent/{agent_id}` - Delete agent
- `POST /call` - Make voice call
- `GET /call/{call_id}` - Get call status

**Agent Configuration:**
```json
{
  "agent_name": "Appointment Reminder",
  "agent_welcome_message": "Hello, this is a reminder about your appointment.",
  "webhook_url": "https://your-api.com/bolna/webhook",
  "tasks": [
    {
      "task_type": "conversation",
      "toolchain": {
        "execution": "parallel",
        "pipelines": [["transcriber", "llm", "synthesizer"]]
      }
    }
  ],
  "agent_prompts": {
    "task_1": {
      "system_prompt": "You are an appointment reminder assistant..."
    }
  }
}
```

**Call Request:**
```json
{
  "agent_id": "agent_xxx",
  "recipient_phone_number": "+919876543210",
  "from_phone_number": "+1234567890"
}
```

### Frontend Components

1. **Settings Tab: Voice Agent**
   - Location: `frontend/components/dashboard/organization/settings.tsx`
   - Add new tab for Bolna configuration

2. **Voice Agents Page**
   - Location: `frontend/app/(dashboard)/dashboard/org/voice-agents/page.tsx`
   - List, create, edit, delete agents

3. **Call History Page**
   - Location: `frontend/app/(dashboard)/dashboard/org/call-history/page.tsx`
   - View all calls with filters

### Security Considerations

1. **API Key Encryption:**
   - Use AES-256 encryption for storing API keys
   - Encryption key stored in environment variable
   - Never expose decrypted key to frontend

2. **Phone Number Validation:**
   - Validate phone numbers before making calls
   - Support international format (+country code)

3. **Rate Limiting:**
   - Implement rate limiting on call endpoints
   - Prevent abuse of voice calling feature

4. **Webhook Security:**
   - Validate webhook signatures from Bolna
   - Use HTTPS for webhook endpoint

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Database schema migration
- [ ] API key storage with encryption
- [ ] Settings UI for API key

### Phase 2: Agent Management
- [ ] Bolna API client service
- [ ] Agent CRUD endpoints
- [ ] Agent management UI

### Phase 3: Calling Feature
- [ ] Call initiation endpoint
- [ ] Webhook handler for status updates
- [ ] Call UI with status tracking

### Phase 4: History & Analytics
- [ ] Call history endpoints
- [ ] Call history UI with filters
- [ ] Basic analytics dashboard

---

## Dependencies

- `crypto` (Node.js built-in) - For API key encryption
- No additional frontend packages required (using existing UI components)

## Environment Variables

```env
# Add to api/.env
BOLNA_ENCRYPTION_KEY=your-32-character-encryption-key
BOLNA_WEBHOOK_SECRET=your-webhook-secret
```

## References

- [Bolna AI Documentation](https://docs.bolna.dev)
- [Bolna API Reference](https://api.bolna.dev/docs)
