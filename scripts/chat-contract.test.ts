import assert from "node:assert/strict";

import { NextRequest } from "next/server";
import { POST as postChat } from "../app/api/chat/route";
import { officeInfo } from "@shared/officeInfo";

type ChatAction = {
  readonly label: string;
  readonly href: string;
  readonly external?: boolean;
};

type ChatResponse = {
  readonly message: string;
  readonly actions?: readonly ChatAction[];
  readonly suggestedPrompts?: readonly string[];
  readonly source?: "knowledge-base" | "llm";
};

type RestoreableEnv = {
  readonly previousUseOpenAI?: string;
  readonly previousUseAIGateway?: string;
  readonly previousOpenAIApiKey?: string;
  readonly previousGatewayApiKey?: string;
};

const officeAddress = `${officeInfo.address.line1}, ${officeInfo.address.city}, ${officeInfo.address.region} ${officeInfo.address.postalCode}`;

function postPayload(message: string, pathname = "/"): NextRequest {
  return new NextRequest("https://www.chriswongdds.com/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, pathname }),
  });
}

async function postChatJson<T>(message: string, pathname = "/"): Promise<{ response: Response; payload: T }> {
  const response = await postChat(postPayload(message, pathname));
  const payload = (await response.json()) as T;
  return { response, payload };
}

function withMockedOpenAIResponse<TResult>(
  mockBody: unknown,
  callback: () => Promise<TResult>,
): Promise<TResult> {
  const previousFetch = globalThis.fetch;
  const envState: RestoreableEnv = {
    previousUseOpenAI: process.env.CHAT_USE_OPENAI,
    previousUseAIGateway: process.env.CHAT_USE_AI_GATEWAY,
    previousOpenAIApiKey: process.env.OPENAI_API_KEY,
    previousGatewayApiKey: process.env.AI_GATEWAY_API_KEY,
  };

  process.env.CHAT_USE_AI_GATEWAY = "true";
  process.env.CHAT_USE_OPENAI = "true";
  process.env.AI_GATEWAY_API_KEY = process.env.AI_GATEWAY_API_KEY ?? "test-gateway-key";
  process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "test-openai-key";

  globalThis.fetch = (async () => {
    return new Response(
      typeof mockBody === "string" ? mockBody : JSON.stringify(mockBody),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  }) as typeof fetch;

  return callback().finally(() => {
    globalThis.fetch = previousFetch;
    if (envState.previousUseOpenAI === undefined) {
      delete process.env.CHAT_USE_OPENAI;
    } else {
      process.env.CHAT_USE_OPENAI = envState.previousUseOpenAI;
    }
    if (envState.previousUseAIGateway === undefined) {
      delete process.env.CHAT_USE_AI_GATEWAY;
    } else {
      process.env.CHAT_USE_AI_GATEWAY = envState.previousUseAIGateway;
    }

    if (envState.previousOpenAIApiKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = envState.previousOpenAIApiKey;
    }

    if (envState.previousGatewayApiKey === undefined) {
      delete process.env.AI_GATEWAY_API_KEY;
    } else {
      process.env.AI_GATEWAY_API_KEY = envState.previousGatewayApiKey;
    }
  });
}

function assertActionsContain(actions: readonly ChatAction[] | undefined, href: string): void {
  assert.ok(actions?.some((action) => action.href === href), `missing action ${href}`);
}

function assertHasPhoneAction(actions: readonly ChatAction[] | undefined): void {
  assert.ok(
    actions?.some((action) => action.href.startsWith("tel:")),
    "expected phone action in response",
  );
}

function assertHasHttpsAction(actions: readonly ChatAction[] | undefined): void {
  assert.ok(
    actions?.some((action) => /^https:\/\//.test(action.href)),
    "expected secure external action in response",
  );
}

function assertPromptCount(actions: readonly string[] | undefined, min = 2): void {
  assert.ok((actions?.length ?? 0) >= min, `expected at least ${min} prompts`);
}

async function testRejectsEmptyQuestion() {
  const response = await postChat(
    new NextRequest("https://www.chriswongdds.com/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "   " }),
    }),
  );
  assert.equal(response.status, 400);
  const payload = (await response.json()) as { message: string };
  assert.match(payload.message, /please send your question/i);
}

async function testMalformedJsonRequestReturnsServerError() {
  const response = await postChat(
    new NextRequest("https://www.chriswongdds.com/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    }),
  );
  assert.equal(response.status, 500);
}

async function testScheduleIntentAnswers() {
  const { response, payload } = await postChatJson<ChatResponse>(
    "Can I book an appointment?",
    "/",
  );

  assert.equal(response.status, 200);
  assert.equal(payload.source, "knowledge-base");
  assert.ok(payload.message.includes("I'd be happy to help you schedule"));
  assertActionsContain(payload.actions, "/schedule#appointment");
  assertHasPhoneAction(payload.actions);
  assertPromptCount(payload.suggestedPrompts);
}

async function testEmergencyIntentEscalates() {
  const { response, payload } = await postChatJson<ChatResponse>(
    "I have severe pain and swelling.",
    "/contact",
  );

  assert.equal(response.status, 200);
  assert.ok(payload.source === "knowledge-base");
  assert.match(
    payload.message,
    /urgent|severe pain|call us right away|call the office/i,
  );
  assertHasPhoneAction(payload.actions);
}

async function testServicesIntentReturnsDirectCannedResponse() {
  const { response, payload } = await postChatJson<ChatResponse>(
    "What services do you offer?",
    "/",
  );

  assert.equal(response.status, 200);
  assert.equal(payload.source, "knowledge-base");
  assert.ok(payload.message.toLowerCase().includes("preventive"));
  assert.ok(payload.message.toLowerCase().includes("invisalign"));
  assert.ok(payload.message.toLowerCase().includes("services"));
  assertActionsContain(payload.actions, "/services");
}

async function testEmergencyPolicyIntentReturnsPolicyResponse() {
  const { response, payload } = await postChatJson<ChatResponse>(
    "Do you take emergencies?",
    "/contact",
  );

  assert.equal(response.status, 200);
  assert.equal(payload.source, "knowledge-base");
  assert.match(payload.message.toLowerCase(), /we do take|emergency|call us/i);
  assertHasPhoneAction(payload.actions);
}

async function testCannedQueriesStayDeterministicWhenGatewayEnabled() {
  const mockOpenAIResponse = {
    choices: [
      {
        message: {
          content: JSON.stringify({
            message: "Model drift should not override canned content.",
            source: "llm",
          }),
        },
      },
    ],
  };

  await withMockedOpenAIResponse(mockOpenAIResponse, async () => {
    const servicesQuery = await postChatJson<ChatResponse>(
      "What services do you offer?",
      "/",
    );
    assert.equal(servicesQuery.response.status, 200);
    assert.equal(servicesQuery.payload.source, "knowledge-base");
    assert.ok(servicesQuery.payload.message.toLowerCase().includes("preventive"));

    const emergencyPolicyQuery = await postChatJson<ChatResponse>(
      "Do you take emergencies?",
      "/",
    );
    assert.equal(emergencyPolicyQuery.response.status, 200);
    assert.equal(emergencyPolicyQuery.payload.source, "knowledge-base");
    assert.ok(emergencyPolicyQuery.payload.message.toLowerCase().includes("emergencies"));
  });
}

async function testLocationIntentAnswersWithAddressAndDirections() {
  const { response, payload } = await postChatJson<ChatResponse>(
    "Where is your office located?",
    "/services",
  );

  assert.equal(response.status, 200);
  assert.equal(payload.source, "knowledge-base");
  assert.ok(payload.message.toLowerCase().includes("located at"));
  assert.ok(payload.message.includes(officeInfo.address.line1));
  assert.ok(payload.message.includes(officeAddress));
  assertActionsContain(payload.actions, "/locations");
  assertHasHttpsAction(payload.actions);
}

async function testLocationIntentBeatsFuzzyFaqMatch() {
  const { response, payload } = await postChatJson<ChatResponse>(
    "Where is your office located and what payment options do you offer?",
    "/services",
  );

  assert.equal(response.status, 200);
  assert.equal(payload.source, "knowledge-base");
  assert.ok(payload.message.toLowerCase().includes(officeInfo.address.line1.toLowerCase()));
  assert.ok(!payload.message.toLowerCase().includes("insurance card"));
  assertActionsContain(payload.actions, "/locations");
}

async function testMedicalQuestionIsHandledSafely() {
  const { response, payload } = await postChatJson<ChatResponse>(
    "Can you diagnose this pain and prescribe medication?",
    "/",
  );

  assert.equal(response.status, 200);
  assert.equal(payload.source, "knowledge-base");
  assert.match(payload.message.toLowerCase(), /can't provide|can't provide|cannot provide|call the office/i);
}

async function testHoursIntentReturnsSchedule() {
  const { response, payload } = await postChatJson<ChatResponse>(
    "What are your office hours?",
    "/",
  );

  assert.equal(response.status, 200);
  assert.equal(payload.source, "knowledge-base");
  assert.ok(payload.message.includes("Monday"));
  assert.ok(payload.message.includes("Friday"));
  assertActionsContain(payload.actions, "/schedule#appointment");
  assertHasPhoneAction(payload.actions);
}

async function testInsuranceIntentProvidesPracticalAnswer() {
  const { response, payload } = await postChatJson<ChatResponse>(
    "Do you accept insurance?",
    "/patient-resources",
  );

  assert.equal(response.status, 200);
  assert.equal(payload.source, "knowledge-base");
  assert.match(payload.message, /insurance|coverage|pay/i);
  assertHasPhoneAction(payload.actions);
}

async function testFirstVisitFaqReturnsConcreteAnswer() {
  const { response, payload } = await postChatJson<ChatResponse>(
    "What should I bring to my first visit?",
    "/patient-resources",
  );

  assert.equal(response.status, 200);
  assert.equal(payload.source, "knowledge-base");
  assert.ok(payload.message.toLowerCase().includes("insurance card"));
  assertActionsContain(payload.actions, "/patient-resources");
}

async function testInvisalignIntentReturnsClinicalAnswer() {
  const { response, payload } = await postChatJson<ChatResponse>(
    "Do you offer Invisalign for adults?",
    "/services",
  );

  assert.equal(response.status, 200);
  assert.equal(payload.source, "knowledge-base");
  assert.ok(payload.message.toLowerCase().includes("aligner"));
  assertActionsContain(payload.actions, "/invisalign");
}

async function testWhiteningIntentReturnsClinicalAnswer() {
  const { response, payload } = await postChatJson<ChatResponse>(
    "What whitening options do you offer?",
    "/zoom-whitening",
  );

  assert.equal(response.status, 200);
  assert.equal(payload.source, "knowledge-base");
  assert.ok(payload.message.toLowerCase().includes("whitening"));
  assertActionsContain(payload.actions, "/zoom-whitening");
}

async function testUnknownQueryGetsClarifyingFallback() {
  const { response, payload } = await postChatJson<ChatResponse>(
    "abracadabra",
    "/",
  );

  assert.equal(response.status, 200);
  assert.equal(payload.source, "knowledge-base");
  assert.ok(
    payload.message.includes("I can help with scheduling, services, office info, and insurance questions."),
  );
  assertPromptCount(payload.suggestedPrompts, 2);
  assertActionsContain(payload.actions, "/about");
  assertActionsContain(payload.actions, "/services");
  assertActionsContain(payload.actions, "/schedule");
}

async function testOpenAISanitizesResponse() {
  const mockOpenAIResponse = {
    choices: [
      {
        message: {
          content: JSON.stringify({
            message: "Great—I can help with your specific request.",
            actions: [
              { label: "Safe internal link", href: "/services" },
              { label: "Dangerous script", href: "javascript:alert('x')" },
              { label: "", href: "/missing-label" },
              { label: "Schedule", href: "/schedule#appointment" },
              { label: "Too long prompt".repeat(20), href: "/too-long-action" },
              { label: "Call", href: "tel:+16503266319", external: true },
            ],
            suggestedPrompts: [
              "Can I book online?",
              "",
              "What are your office hours?",
              "x".repeat(140),
            ],
            source: "llm",
          }),
        },
      },
    ],
  };

  await withMockedOpenAIResponse(mockOpenAIResponse, async () => {
    const { response, payload } = await postChatJson<ChatResponse>(
      "Can you suggest a color palette for a living room?",
      "/home",
    );

    assert.equal(response.status, 200);
    assert.equal(payload.message, "Great—I can help with your specific request.");
    assert.equal(payload.source, "llm");
    assert.equal(payload.actions?.length, 3);
    assert.deepEqual(payload.actions?.[0], {
      label: "Safe internal link",
      href: "/services",
      external: false,
    });
    assert.ok(payload.actions?.some((action) => action.external));
    assert.ok(payload.suggestedPrompts?.every((entry) => entry.length <= 120));
  });
}

async function testOpenAIFallbackWhenPayloadIsInvalid() {
  await withMockedOpenAIResponse("not-json", async () => {
    const { response, payload } = await postChatJson<ChatResponse>(
      "What are your hours?",
      "/schedule",
    );

    assert.equal(response.status, 200);
    assert.equal(payload.source, "knowledge-base");
    assert.ok(payload.message.includes("Our office is open at these times"));
  });
}

async function testOpenAIReturnsInvalidSourceAsKnowledgeFallbackValue() {
  const mockOpenAIResponse = {
    choices: [
      {
        message: {
          content: JSON.stringify({
            message: "I can answer from LLM but with invalid source flag.",
            source: "cache",
          }),
        },
      },
    ],
  };

  await withMockedOpenAIResponse(mockOpenAIResponse, async () => {
    const { response, payload } = await postChatJson<ChatResponse>(
      "Can I get a checkup soon?",
      "/",
    );

    assert.equal(response.status, 200);
    assert.equal(payload.source, "knowledge-base");
  });
}

(async function run() {
  delete process.env.OPENAI_API_KEY;
  delete process.env.AI_GATEWAY_API_KEY;
  delete process.env.CHAT_USE_OPENAI;
  delete process.env.CHAT_USE_AI_GATEWAY;

  await testRejectsEmptyQuestion();
  await testMalformedJsonRequestReturnsServerError();
  await testScheduleIntentAnswers();
  await testEmergencyIntentEscalates();
  await testServicesIntentReturnsDirectCannedResponse();
  await testEmergencyPolicyIntentReturnsPolicyResponse();
  await testCannedQueriesStayDeterministicWhenGatewayEnabled();
  await testLocationIntentAnswersWithAddressAndDirections();
  await testLocationIntentBeatsFuzzyFaqMatch();
  await testMedicalQuestionIsHandledSafely();
  await testHoursIntentReturnsSchedule();
  await testInsuranceIntentProvidesPracticalAnswer();
  await testFirstVisitFaqReturnsConcreteAnswer();
  await testInvisalignIntentReturnsClinicalAnswer();
  await testWhiteningIntentReturnsClinicalAnswer();
  await testUnknownQueryGetsClarifyingFallback();
  await testOpenAISanitizesResponse();
  await testOpenAIFallbackWhenPayloadIsInvalid();
  await testOpenAIReturnsInvalidSourceAsKnowledgeFallbackValue();

  console.log("Chatbot contract checks passed.");
})();
