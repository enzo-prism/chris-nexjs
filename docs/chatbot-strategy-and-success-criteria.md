# Dental Practice Chatbot Strategy and Success Criteria

## Research summary (as of 2026-02-26)

I reviewed official guidance around:
- Vercel/App Router chatbot patterns and streaming in the AI ecosystem
- OpenAI structured outputs / JSON response shaping for UI-safe chatbot replies

Key direction:
- Use ShadCN UI for the client shell and actions so the widget matches the existing design system.
- Keep one trusted, deterministic path for core intent answers (scheduling, hours, location, insurance) and optionally layer LLM responses on top.
- Keep the LLM constrained to site knowledge (address, hours, services, scheduling links) and sanitize structured output before rendering.
- Keep all action links server-approved and validate outbound destinations (internal route or explicit `tel:/mailto:/http` protocols).

## Proposed architecture for this website

1. Front-end widget:
   - Floating card in bottom-right with clear open/close states.
   - Quick-start prompts and contextual action chips.
   - Persistent in-page context (`pathname`) for smarter page-specific recommendations.
2. API handler:
   - Strict input validation (`message`, bounded length).
   - Knowledge-first rule engine for fast, deterministic responses.
   - Optional LLM fallback when `CHAT_USE_AI_GATEWAY=true` (or legacy `CHAT_USE_OPENAI=true`), via Vercel AI Gateway.
   - Response sanitation for action links, labels, and prompts.
3. Safety and reliability:
   - Reject requests for diagnosis/medication and steer users to the office.
   - Never trust raw LLM JSON; parse and sanitize before return.
   - Return 400 for invalid inputs and friendly 500 fallback for unexpected failures.

## Product success criteria

### 1) Core response behavior (must be met on first assistant response)

#### 1.1 Scheduling intent
- Query examples:
  - "Can I book an appointment?"
  - "I need to schedule a cleaning."
  - "How do I make an appointment?"
- Required behavior:
  - Responds with direct scheduling guidance (not link-only).
  - Includes `/schedule#appointment` action.
  - Includes a phone action (`tel:`) as a backup path.
  - Returns `source: "knowledge-base"` unless overridden by gateway override.

#### 1.2 Emergency / urgent intent
- Query examples:
  - "I have severe pain and swelling."
  - "Is this an emergency?"
  - "I need urgent dental care."
- Required behavior:
  - Explicit urgent care direction appears before any marketing content.
  - Includes at least one immediate callback action (`tel:`).
  - Does not provide diagnosis or medication treatment.

#### 1.3 Location intent
- Query examples:
  - "Where is your office located?"
  - "Where are you?"
  - "Need directions."
- Required behavior:
  - Returns full office street/city/region context in the message.
  - Includes `/locations` and a map action with external protocol (`https`).

#### 1.4 Hours intent
- Query examples:
  - "What are your office hours?"
  - "Are you open on Friday?"
- Required behavior:
  - Returns explicit Monday-Sunday schedule.
  - Includes `/schedule#appointment` and a `tel:` follow-up.

#### 1.5 Insurance intent
- Query examples:
  - "Do you accept insurance?"
  - "Can you verify my PPO?"
- Required behavior:
  - Provides practical insurance collection guidance.
  - Includes a direct contact option and/or phone action.

#### 1.6 FAQ intent
- Query examples:
  - "What should I bring to my first visit?"
  - "Do you offer Invisalign?"
  - "Do you offer whitening?"
- Required behavior:
  - Direct answer text is returned in the first message.
  - Includes related action and/or suggested follow-up prompts.

#### 1.7 Ambiguous / unknown
- Query examples:
  - "Tell me about your policy."
  - "Anything else?"
- Required behavior:
  - Never responds with only a single link.
  - Includes clarification and at least two suggested prompts.
  - Includes fallback actions (`/about`, `/services`, `/schedule`).

### 2) Structured output integrity
- Response JSON shape must always include `message`.
- `actions` and `suggestedPrompts` must be sanitized:
  - no empty labels, no dangerous protocols.
  - maximum action count <= 4, prompt count <= 5.
- `source` must always be one of `knowledge-base` or `llm`.

### 3) Safety and reliability
- No diagnosis/medication/recommendation advice.
- `400` for invalid payloads (empty message / malformed shape).
- `500` for malformed JSON body parse errors.
- Gateway failures or malformed JSON from model must not break request; fallback to knowledge response.

### 4) UX behavior
- Loading indicator shown while assistant is generating a response.
- Welcome state and follow-up prompt chips remain tappable.
- Response always displays answer text before action links.
- On each success, at least one follow-up signal is present (actions or prompts).

## Test coverage created

- `scripts/chat-contract.test.ts` validates:
  - invalid request handling (`400`)
  - schedule and emergency intent response behavior
  - location answer coverage and map/phone actions
  - LLM fallback success
  - LLM malformed output rejection and safe-response recovery
- Package script added: `pnpm run test:chatbot`

## Recommended next iteration

1. Add a short interaction log (anonymized) to tune intent wording over 30–60 days.
2. Add a short admin-configurable quick-action list (`JSON` in `shared/`) so marketing can test phrasing without code edits.
3. Optional: migrate to Vercel AI SDK streaming while keeping the same strict JSON schema for this use case.

## Assistant Success Criteria (response-by-query)

This version should be judged against deterministic, query-class behavior before any subjective quality review.

### 1) Scheduling intent

- Query patterns:
  - "Can I book..."
  - "Need to schedule..."
  - "How do I make an appointment?"
  - "schedule me..." 
- Required:
  - First response must directly answer with a scheduling path (no generic preamble).
  - Must include `"/schedule#appointment"` in actions.
  - Must include a `tel:` action.
  - Suggested prompts must include at least one scheduling follow-up.

### 2) Location intent

- Query patterns:
  - "Where is your office?"
  - "Where are you located?"
  - "Need directions"
- Required:
  - First response must include the office address text (at minimum street/city/state/ZIP context).
  - Must include `"/locations"` and map URL.
  - Must include at least one useful follow-up prompt (hours / parking / nearby transit).
- Non-negotiable:
  - A location question must not be answered by insurance/frequently asked question fallback.

### 3) Emergency intent

- Query patterns:
  - "I have severe pain"
  - "injury"
  - "swelling or bleeding"
- Required:
  - Must advise immediate call action and escalate tone.
  - Must not provide diagnosis/medication recommendations.
  - Must include a `tel:` action.

### 4) Hours intent

- Query patterns:
  - "Office hours"
  - "What time are you open"
- Required:
  - Must include Monday through Friday schedule language (or equivalent schedule output).
  - Must include scheduling action and phone fallback.

### 5) Insurance intent

- Query patterns:
  - "Do you accept insurance?"
  - "What plans do you take?"
- Required:
  - Must answer about insurance pragmatically and include phone/contact option.

### 6) FAQ intent

- Query patterns:
  - first visit questions
  - Invisalign
  - whitening
- Required:
  - Must provide a direct practice-specific answer in message body.
  - Should include related action and/or prompts.

### 7) Ambiguous or unknown intent

- Required:
  - Never degrade to link-only response.
  - Must include clarifying sentence + at least two suggested prompts.
  - Must include fallback actions for `"/about"`, `"/services"`, and `"/schedule"`.

### 8) Safety and integrity constraints

- Must reject diagnosis/medication advisory requests with a direct transfer-to-office response.
- Must preserve response shape:
  - `message` always present non-empty.
  - `actions` and `suggestedPrompts` sanitized (no `javascript:`/`data:` URLs, no empty labels, no unsafe payloads).
- Must preserve source semantics:
  - `source` is always `knowledge-base` or `llm`.
- Gateway failures or malformed model JSON must degrade to sanitized knowledge reply.

## Success criteria by channel state

- Input validation: empty/invalid input returns HTTP 400.
- Malformed JSON request returns HTTP 500.
- On runtime gateway failures: still returns valid knowledge-based response.

## Implementation acceptance

The chatbot is considered "good enough" when all of the following are true:

1. Every query class in section 1-7 returns the required behaviors for at least 3 independent phrasing variants.
2. Structured output sanitization rejects every invalid action/prompt payload in tests.
3. No location query is answered by generic FAQ fallback.
4. No medical advice is provided for pain/diagnosis prompts.

## Vercel AI Gateway implementation notes

- Keep `AI_GATEWAY_API_KEY` in environment and set `AI_GATEWAY_MODEL` for provider/model selection (for example `openai/gpt-4o-mini`).
- Optionally override endpoint with `VERCEL_AI_GATEWAY_BASE_URL` (defaults to `https://ai-gateway.vercel.sh/v1`).
- Local OIDC flow: run `vercel link`, `vercel env pull`, then use `vercel dev` during development.
