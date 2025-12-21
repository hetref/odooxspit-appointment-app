# Bolna AI Integration - Implementation Tasks

## Phase 1: Foundation (Database & API Key)

### Task 1.1: Database Schema Migration
- [ ] Add `bolnaApiKey` field to Organization model in `api/prisma/schema.prisma`
- [ ] Create `BolnaAgent` model
- [ ] Create `BolnaCall` model with `BolnaCallStatus` enum
- [ ] Run `npx prisma migrate dev --name add_bolna_integration`
- [ ] Generate Prisma client

### Task 1.2: Encryption Utilities
- [ ] Create `api/src/lib/encryption.js` with encrypt/decrypt functions
- [ ] Add `BOLNA_ENCRYPTION_KEY` to `.env.example`
- [ ] Test encryption/decryption

### Task 1.3: Bolna API Client
- [ ] Create `api/src/lib/bolnaClient.js`
- [ ] Implement `validateKey()` method
- [ ] Implement agent CRUD methods
- [ ] Implement call methods
- [ ] Add error handling

### Task 1.4: API Key Endpoints
- [ ] Create `api/src/controllers/bolnaController.js`
- [ ] Implement `saveApiKey` - encrypt and store API key
- [ ] Implement `getApiKeyStatus` - check if configured and valid
- [ ] Implement `deleteApiKey` - remove API key
- [ ] Create `api/src/routes/bolna.js` with routes
- [ ] Register routes in `api/src/server.js`

### Task 1.5: Settings UI - Voice Agent Tab
- [ ] Add "Voice Agent" tab to `frontend/components/dashboard/organization/settings.tsx`
- [ ] Create API key input with show/hide toggle
- [ ] Add save/update button with loading state
- [ ] Show connection status (Connected/Not Connected/Invalid)
- [ ] Add `bolnaApi` functions to `frontend/lib/api.ts`

---

## Phase 2: Agent Management

### Task 2.1: Agent CRUD Endpoints
- [ ] Implement `createAgent` in bolnaController
  - Validate input
  - Create agent in Bolna API
  - Store agent in database
- [ ] Implement `getAgents` - list all agents for organization
- [ ] Implement `getAgent` - get single agent details
- [ ] Implement `updateAgent` - update agent in Bolna and database
- [ ] Implement `deleteAgent` - delete from Bolna and database
- [ ] Add routes to `api/src/routes/bolna.js`

### Task 2.2: Voice Agents Page
- [ ] Create `frontend/app/(dashboard)/dashboard/org/voice-agents/page.tsx`
- [ ] Create agent list component with cards
- [ ] Show agent name, language, status, call count
- [ ] Add create new agent button
- [ ] Add edit/delete actions per agent

### Task 2.3: Agent Form Component
- [ ] Create `frontend/components/dashboard/organization/voice-agent-form.tsx`
- [ ] Form fields: name, welcome message, instructions, language
- [ ] Validation for required fields
- [ ] Support create and edit modes
- [ ] Loading states and error handling

### Task 2.4: Navigation Update
- [ ] Add "Voice Agents" link to organization navbar
- [ ] Only show if organization has Bolna API key configured

---

## Phase 3: Calling Feature

### Task 3.1: Call Endpoints
- [ ] Implement `makeCall` in bolnaController
  - Validate phone number (E.164 format)
  - Get agent's Bolna ID
  - Call Bolna API
  - Create call record in database
- [ ] Implement `getCalls` - list calls with pagination and filters
- [ ] Implement `getCall` - get single call details
- [ ] Add routes

### Task 3.2: Webhook Handler
- [ ] Implement `handleWebhook` in bolnaController
- [ ] Validate webhook signature (if Bolna provides)
- [ ] Update call status in database
- [ ] Store recording URL and transcript
- [ ] Handle different event types

### Task 3.3: Make Call Dialog
- [ ] Create `frontend/components/dashboard/organization/call-dialog.tsx`
- [ ] Phone number input with validation
- [ ] Agent selection (if multiple)
- [ ] Call button with loading state
- [ ] Show call status after initiation

### Task 3.4: Test Agent Feature
- [ ] Add "Test" button to agent cards
- [ ] Open call dialog pre-filled with agent
- [ ] Show test call status

---

## Phase 4: History & Analytics

### Task 4.1: Call History Page
- [ ] Create `frontend/app/(dashboard)/dashboard/org/call-history/page.tsx`
- [ ] Table with columns: Date, Agent, Phone, Status, Duration
- [ ] Filters: Agent, Status, Date Range
- [ ] Pagination
- [ ] View details action

### Task 4.2: Call Details Modal
- [ ] Show full call information
- [ ] Display transcript if available
- [ ] Audio player for recording if available
- [ ] Call metadata

### Task 4.3: Analytics Cards
- [ ] Total calls count
- [ ] Success rate percentage
- [ ] Average call duration
- [ ] Calls by status chart (optional)

### Task 4.4: Export Feature
- [ ] Export call history to CSV
- [ ] Include all relevant fields

---

## Phase 5: Polish & Testing

### Task 5.1: Error Handling
- [ ] Handle Bolna API errors gracefully
- [ ] Show user-friendly error messages
- [ ] Retry logic for transient failures

### Task 5.2: Loading States
- [ ] Skeleton loaders for lists
- [ ] Button loading states
- [ ] Page loading indicators

### Task 5.3: Validation
- [ ] Phone number validation (E.164)
- [ ] Agent name length limits
- [ ] Instructions length limits
- [ ] API key format validation

### Task 5.4: Documentation
- [ ] Update README with Bolna setup instructions
- [ ] Document environment variables
- [ ] API documentation

---

## Environment Variables Required

```env
# api/.env
BOLNA_ENCRYPTION_KEY=your-32-character-encryption-key-here
BOLNA_WEBHOOK_SECRET=optional-webhook-secret
```

## Commands Reference

```bash
# Run migration
cd api && npx prisma migrate dev --name add_bolna_integration

# Generate Prisma client
cd api && npx prisma generate

# Start development servers
cd api && npm run dev
cd frontend && npm run dev
```

## Testing Checklist

- [ ] Save API key - verify encryption
- [ ] Validate API key - test with valid/invalid keys
- [ ] Create agent - verify in Bolna dashboard
- [ ] Update agent - verify changes sync
- [ ] Delete agent - verify cleanup
- [ ] Make call - verify call initiated
- [ ] Webhook - verify status updates
- [ ] Call history - verify filtering works
- [ ] Error scenarios - verify graceful handling
