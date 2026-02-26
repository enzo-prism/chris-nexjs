import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { officeInfo } from "@shared/officeInfo";
import { seoByPath } from "@shared/seo";
import { faqItems } from "@/lib/data";
import { supplementalContentByPath } from "@/lib/supplementalContent";

export const maxDuration = 15;

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

type InternalChatResponse = ChatResponse & {
  readonly skipAiGateway?: true;
};

type ChatRequest = {
  readonly message: string;
  readonly pathname?: string;
  readonly history?: readonly {
    readonly role: "user" | "assistant";
    readonly content: string;
  }[];
};

const chatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Please send a question.")
    .max(500, "Please keep your message under 500 characters."),
  pathname: z.string().trim().default("/"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(500),
      }),
    )
    .max(8)
    .default([]),
});

const scheduleAction: readonly ChatAction[] = [
  { label: "Open scheduling page", href: "/schedule#appointment" },
  { label: "Contact our office", href: "/contact" },
  { label: `Call ${officeInfo.phone}`, href: `tel:${officeInfo.phoneE164}`, external: true },
];

const quickStartPrompts = [
  "What services do you offer?",
  "Can I book an appointment?",
  "How do I get to your Palo Alto office?",
  "Do you offer emergency dental care?",
] as const;

const servicesQueryPhrases = [
  "what services do you offer",
  "which services do you offer",
  "what services are available",
  "what services are offered",
  "services do you offer",
  "services you offer",
  "services available",
  "what can i do at the practice",
  "what does your office do",
] as const;

const emergencyPolicyPhrases = [
  "do you take emergencies",
  "do you take emergency",
  "do you handle emergencies",
  "do you offer emergency care",
  "do you offer emergency",
  "do you accept emergencies",
  "do you accept emergency",
  "emergency dental care",
  "are emergencies accepted",
] as const;

const faqPromptFallbacks = ["What are your office hours?", "How long is a first visit?"];
const faqStopWords = new Set([
  "the",
  "and",
  "can",
  "you",
  "your",
  "for",
  "with",
  "are",
  "this",
  "that",
  "have",
  "how",
  "what",
  "from",
  "about",
  "they",
  "they",
  "them",
  "our",
  "would",
  "will",
  "there",
  "which",
  "should",
  "could",
  "there",
  "when",
  "then",
]);

type SeoKnowledge = {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly indexable: boolean;
  readonly keywords: string;
};

const pageKnowledge: readonly SeoKnowledge[] = Object.entries(seoByPath).map(
  ([path, entry]) => ({
    path,
    title: entry.title,
    description: entry.description ?? "",
    indexable: entry.indexable,
    keywords: `${path} ${entry.title} ${entry.description ?? ""}`.toLowerCase(),
  }),
);

const scheduleKeywords = [
  "schedule",
  "appointment",
  "book",
  "booking",
  "availability",
  "calendar",
] as const;

const emergencyKeywords = ["emergency", "urgent", "pain", "hurt", "bleed", "swell", "swollen"] as const;
const locationKeywords = ["address", "location", "map", "direction", "parking", "where", "come"] as const;
const insuranceKeywords = ["insurance", "pay", "payment", "cost", "price", "fee", "price"] as const;
const hoursKeywords = ["hours", "open", "openings", "availability", "time", "closed"] as const;
const medicalAdviceKeywords = [
  "diagnose",
  "diagnosis",
  "medication",
  "drug",
  "antibiotic",
  "surgery",
  "toothache cause",
  "what is wrong",
] as const;

const servicesIntentKeywords = [
  "services",
  "service",
  "offer",
  "available",
  "specialize",
  "provides",
  "provide",
  "specialized",
] as const;

const emergencyPolicyKeywords = ["take", "offer", "accept", "handle", "provide"] as const;

const officeHoursText = `Monday ${officeInfo.hours.monday}, Tuesday ${officeInfo.hours.tuesday}, Wednesday ${officeInfo.hours.wednesday}, Thursday ${officeInfo.hours.thursday}, Friday ${officeInfo.hours.friday}, Saturday ${officeInfo.hours.saturday}, Sunday ${officeInfo.hours.sunday}`;

const faqAnswers = [
  {
  triggers: ["first", "new", "new patient", "initial"],
    response:
      "Great question. For your first visit, bring your insurance card and any records, then we’ll review your needs and build a personalized treatment plan. You can also ask our staff about forms ahead of your appointment.",
    actions: [{ label: "View patient resources", href: "/patient-resources" }],
    prompts: [
      "What should I bring to my first visit?",
      "How long does the first visit usually take?",
    ] as const,
  },
  {
  triggers: ["whitening", "teeth whitening", "zoom", "in-office", "take-home"],
    response:
      "We offer several whitening options depending on your needs, including in-office and take-home approaches. Our team can help you choose the safest option for your smile goals.",
    actions: [{ label: "Explore whitening services", href: "/zoom-whitening" }],
    prompts: [
      "Is ZOOM whitening right for me?",
      "How much does whitening usually cost?",
    ] as const,
  },
  {
  triggers: ["invisalign", "aligners", "ortho", "orthodontic", "teeth straightening"],
    response:
      "Invisalign is a clear aligner option for many patients. We evaluate your bite and smile goals first, then recommend whether aligners are a good fit for you.",
    actions: [{ label: "Learn about Invisalign", href: "/invisalign" }],
    prompts: [
      "How long does Invisalign treatment last?",
      "Do you treat adults with Invisalign?",
    ] as const,
  },
  {
  triggers: ["emergency", "urgent", "pain", "knocked", "abscess", "abscess"],
    response:
      "If this feels like a dental emergency, call us right away so we can reserve time for you. Severe pain, swelling, bleeding, or injuries need prompt attention.",
    actions: [{ label: "Call for urgent care", href: `tel:${officeInfo.phoneE164}`, external: true }],
    prompts: [
      "What counts as a dental emergency?",
      "Are you open on holidays?",
    ] as const,
  },
] as const;

function normalizePath(pathname: string): string {
  const sanitized = pathname.split(/[?#]/)[0] ?? "/";
  return sanitized.length > 1 && sanitized.endsWith("/")
    ? sanitized.slice(0, -1)
    : sanitized;
}

function tokenize(message: string): readonly string[] {
  const normalized = message.toLowerCase();
  const words = normalized.match(/[a-z0-9]+/g) ?? [];
  return words.filter((word) => word.length >= 3).slice(0, 16);
}

function normalizeWords(message: string): string {
  return message.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function includesAnyPhrase(normalizedMessage: string, phrases: readonly string[]): boolean {
  return phrases.some((phrase) => normalizedMessage.includes(phrase));
}

function matchScore(haystack: string, tokens: readonly string[]): number {
  const haystackWords = new Set(normalizeWords(haystack).split(" ").filter((word) => word.length >= 3));
  return tokens.reduce((count, token) => count + (haystackWords.has(token) ? 1 : 0), 0);
}

function summarizeText(text: string, limit = 280): string {
  const sanitized = normalizeWords(text).replace(/\s+/g, " ").trim();
  if (!sanitized) {
    return "";
  }

  return sanitized.length <= limit ? sanitized : `${sanitized.slice(0, limit - 1).trimEnd()}…`;
}

function buildPageSummary(path: string): string {
  const knowledge = pageKnowledge.find((entry) => entry.path === path) ?? pageKnowledge.find((entry) => entry.path === "/");
  const supplemental = supplementalContentByPath[path];

  const pieces: string[] = [];

  if (knowledge) {
    pieces.push(knowledge.description);
  }

  if (supplemental?.[0]) {
    const block = supplemental[0];
    if (block.heading) {
      pieces.push(block.heading);
    }
    if (block.paragraphs[0]) {
      pieces.push(block.paragraphs[0]);
    }
    if (block.bullets?.[0]) {
      pieces.push(block.bullets.join("; "));
    }
  }

  return summarizeText(pieces.join(" "));
}

function findBestFaqMatch(tokens: readonly string[], message: string) {
  const normalizedMessage = normalizeWords(message);
  const meaningfulTokens = tokens.filter((token) => !faqStopWords.has(token));
  let best: (typeof faqItems)[number] | null = null;
  let bestScore = 0;

  for (const item of faqItems) {
    const normalizedQuestion = normalizeWords(item.question);
    const questionWords = new Set(
      normalizedQuestion.split(" ").filter((word) => word.length >= 3),
    );
    const questionScore = meaningfulTokens.reduce(
      (count, token) => count + (questionWords.has(token) ? 1 : 0),
      0,
    );
    const answerScore = matchScore(item.answer, meaningfulTokens);
    const exactMatch = normalizedMessage.includes(normalizedQuestion);

    if (!exactMatch && questionScore === 0) {
      continue;
    }

    const score = questionScore + answerScore;
    if (score > bestScore || (exactMatch && bestScore < 2)) {
      best = item;
      bestScore = exactMatch ? Math.max(score, 2) : score;
    }
  }

  if (!best || bestScore < 2) {
    return null;
  }

  return {
    answer: best.answer,
    followUp:
      best.question.toLowerCase().includes("first")
        ? ["What should I bring to my first visit?", "How long does a first visit take?"]
        : faqPromptFallbacks,
  };
}

function hasIntent(tokens: readonly string[], intents: readonly string[]): boolean {
  return tokens.some((token) => intents.includes(token));
}

function isServicesIntent(normalizedMessage: string, tokens: readonly string[]): boolean {
  return (
    includesAnyPhrase(normalizedMessage, servicesQueryPhrases) ||
    (hasIntent(tokens, ["services", "service"]) &&
      hasIntent(tokens, servicesIntentKeywords))
  );
}

function isEmergencyPolicyIntent(
  normalizedMessage: string,
  tokens: readonly string[],
): boolean {
  return (
    includesAnyPhrase(normalizedMessage, emergencyPolicyPhrases) ||
    (hasIntent(tokens, ["emergency"]) &&
      hasIntent(tokens, emergencyPolicyKeywords) &&
      !hasIntent(tokens, ["pain", "hurt", "bleed", "swell", "swollen", "injury", "injured"]))
  );
}

function sanitizeActions(raw: unknown): readonly ChatAction[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const actionCandidates: ChatAction[] = [];

  for (const entry of raw) {
    if (entry === null || typeof entry !== "object") {
      continue;
    }

    const action = entry as {
      readonly label?: unknown;
      readonly href?: unknown;
      readonly external?: unknown;
    };

    if (typeof action.label !== "string" || typeof action.href !== "string") {
      continue;
    }

    const label = action.label.trim();
    const href = action.href.trim();

    if (label.length < 1 || href.length < 1 || label.length > 80) {
      continue;
    }

    if (
      !/^(\/(?!\/)|#|mailto:|tel:|https?:\/\/)/i.test(href) ||
      href.toLowerCase().startsWith("javascript:") ||
      href.toLowerCase().includes("data:")
    ) {
      continue;
    }

    actionCandidates.push({
      label,
      href,
      external: action.external === true,
    });
  }

  return actionCandidates.slice(0, 4);
}

function sanitizePrompts(raw: unknown): readonly string[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((entry) => {
      if (typeof entry !== "string") {
        return "";
      }

      return entry.trim();
    })
    .filter((entry) => entry.length > 0 && entry.length <= 120)
    .slice(0, 5);
}

function sanitizeChatResponse(raw: unknown): ChatResponse {
  if (raw === null || typeof raw !== "object") {
    return {
      message: "",
      source: "llm",
    };
  }

  const parsed = raw as {
    readonly message?: unknown;
    readonly actions?: unknown;
    readonly suggestedPrompts?: unknown;
    readonly source?: unknown;
  };

  if (typeof parsed.message !== "string" || !parsed.message.trim()) {
    return {
      message: "",
      source: "llm",
    };
  }

  return {
    message: parsed.message.trim(),
    actions: sanitizeActions(parsed.actions),
    suggestedPrompts: sanitizePrompts(parsed.suggestedPrompts),
    source: parsed.source === "llm" ? "llm" : "knowledge-base",
  };
}

function resolveAIGatewayApiKey(): string | null {
  return (
    process.env.AI_GATEWAY_API_KEY ??
    process.env.VERCEL_AI_GATEWAY_API_KEY ??
    process.env.OPENAI_API_KEY ??
    null
  );
}

function resolveAIGatewayBaseUrl(): string {
  const base =
    process.env.VERCEL_AI_GATEWAY_BASE_URL ??
    process.env.AI_GATEWAY_BASE_URL ??
    "https://ai-gateway.vercel.sh/v1";
  return base.replace(/\/+$/, "");
}

function resolveAIGatewayEndpoint(): string {
  const base = resolveAIGatewayBaseUrl();
  return base.endsWith("/chat/completions")
    ? base
    : `${base}/chat/completions`;
}

function resolveAIGatewayModel(): string {
  return process.env.AI_GATEWAY_MODEL ?? process.env.OPENAI_MODEL ?? "openai/gpt-4o-mini";
}

function resolveAIGatewayEnabled(): boolean {
  return (
    process.env.CHAT_USE_AI_GATEWAY === "true" ||
    process.env.CHAT_USE_OPENAI === "true"
  );
}

function safeGatewayHistory(
  history: readonly {
    readonly role: "user" | "assistant";
    readonly content: string;
  }[],
): { role: "user" | "assistant"; content: string }[] {
  return history
    .slice(-8)
    .map((entry) => ({
      role: entry.role,
      content: entry.content.trim(),
    }))
    .filter((entry) => entry.content.length > 0 && entry.content.length <= 500);
}

function buildSuggestedActions(
  message: string,
  defaultFallback: boolean,
): readonly ChatAction[] {
  if (!defaultFallback) {
    return [];
  }

  const actions: ChatAction[] = [
    { label: "About this practice", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Schedule now", href: "/schedule" },
  ];

  if (message.toLowerCase().includes("location")) {
    actions.push({ label: "View office location", href: "/locations" });
  }
  if (message.toLowerCase().includes("insurance")) {
    actions.push({ label: "Insurance details", href: "/patient-resources" });
  }

  return actions;
}

function findRelevantPages(
  tokens: readonly string[],
  limit = 3,
): readonly SeoKnowledge[] {
  if (!tokens.length) {
    return [];
  }

  return pageKnowledge
    .map((entry) => ({
      ...entry,
      score: tokens.reduce(
        (acc, token) => acc + (entry.keywords.includes(token) ? 1 : 0),
        0,
      ),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit) as SeoKnowledge[];
}

function buildKnowledgeReply(
  message: string,
  pathname: string,
): InternalChatResponse {
  const normalizedMessage = normalizeWords(message.trim());
  const tokens = tokenize(normalizedMessage);
  const lowercaseMessage = normalizedMessage.toLowerCase();
  const currentPage =
    pageKnowledge.find((entry) => entry.path === pathname) ??
    pageKnowledge.find((entry) => entry.path === "/")!;

  if (!tokens.length) {
    return {
      message:
        "Ask me about scheduling, services, hours, location, or insurance. I can also answer questions from the practice pages.",
      actions: [
        { label: "Book appointment", href: "/schedule" },
        { label: "Call the office", href: `tel:${officeInfo.phoneE164}`, external: true },
      ],
      suggestedPrompts: quickStartPrompts,
      source: "knowledge-base",
      skipAiGateway: true,
    };
  }

  if (isServicesIntent(normalizedMessage, tokens)) {
    return {
      message:
        "We offer preventive, restorative, cosmetic, and orthodontic care. Core offerings include cleanings/checkups, fillings, crowns, veneers, Invisalign®, whitening, and implant restoration. You can review all services on the Services page.",
      actions: [
        { label: "Explore services", href: "/services" },
        { label: "Invisalign details", href: "/invisalign" },
        { label: "Zoom whitening", href: "/zoom-whitening" },
        { label: "Book appointment", href: "/schedule#appointment" },
      ],
      suggestedPrompts: ["Do you offer emergency care?", "What should I bring to my first visit?"],
      source: "knowledge-base",
      skipAiGateway: true,
    };
  }

  if (hasIntent(tokens, scheduleKeywords)) {
    return {
      message: `Absolutely—I'd be happy to help you schedule. You can use the online scheduler below, or call us at ${officeInfo.phone}.`,
      actions: scheduleAction,
      suggestedPrompts: [
        "What should I bring to my appointment?",
        "Do you take walk-ins?",
      ],
      source: "knowledge-base",
      skipAiGateway: true,
    };
  }

  if (isEmergencyPolicyIntent(lowercaseMessage, tokens)) {
    return {
      message:
        "Yes, we do take dental emergencies. If this is happening now with severe pain, swelling, bleeding, or injury, call us right away so we can triage and try to reserve same-day care.",
      actions: [
        { label: "Call for emergency care", href: `tel:${officeInfo.phoneE164}`, external: true },
        { label: "Open locations", href: "/locations" },
        { label: "Contact us", href: "/contact" },
      ],
      suggestedPrompts: ["What counts as a dental emergency?", "Can you do same-day appointments?"],
      source: "knowledge-base",
      skipAiGateway: true,
    };
  }

  if (hasIntent(tokens, emergencyKeywords)) {
    return {
      message:
        "If you’re experiencing severe symptoms, please call the office as soon as possible so we can prioritize your care.",
      actions: [
        { label: "Call now", href: `tel:${officeInfo.phoneE164}`, external: true },
      ],
      suggestedPrompts: ["Are you open today?", "Where is the office located?"],
      source: "knowledge-base",
      skipAiGateway: true,
    };
  }

  if (hasIntent(tokens, medicalAdviceKeywords)) {
    return {
      message:
        "I can help with scheduling and logistics, but I can’t provide diagnosis or medication advice. Please call the office if this is urgent, and we can help you get seen promptly.",
      actions: [
        { label: "Call now", href: `tel:${officeInfo.phoneE164}`, external: true },
        { label: "Book exam appointment", href: "/schedule#appointment" },
      ],
      suggestedPrompts: [
        "Can I book an appointment today?",
        "What should I bring to my first visit?",
      ],
      source: "knowledge-base",
      skipAiGateway: true,
    };
  }

  if (hasIntent(tokens, locationKeywords)) {
    return {
      message: `We’re located at ${officeInfo.address.line1}, ${officeInfo.address.city}, ${officeInfo.address.region} ${officeInfo.address.postalCode}. You can view detailed hours and a map link in the contact section.`,
      actions: [
        { label: "Open locations", href: "/locations" },
        { label: "Get directions", href: officeInfo.mapUrl, external: true },
      ],
      suggestedPrompts: ["What are your current hours?", "Do you have parking nearby?"],
      source: "knowledge-base",
      skipAiGateway: true,
    };
  }

  if (hasIntent(tokens, hoursKeywords)) {
    return {
      message: `Our office is open at these times: ${officeHoursText}.`,
      actions: [
        { label: "View schedule page", href: "/schedule#appointment" },
        { label: "Call for updates", href: `tel:${officeInfo.phoneE164}`, external: true },
      ],
      suggestedPrompts: [
        "Can I get a same-day appointment?",
        "Are weekends open?",
      ],
      source: "knowledge-base",
      skipAiGateway: true,
    };
  }

  if (hasIntent(tokens, insuranceKeywords)) {
    return {
      message:
        "We work with major dental insurers and can review your specific plan when you call. Contact us or fill out the contact form so we can confirm coverage details before your visit.",
      actions: [
        { label: "Call for insurance details", href: `tel:${officeInfo.phoneE164}`, external: true },
        { label: "Contact us", href: "/contact" },
      ],
      suggestedPrompts: ["Do you offer payment plans?", "What should I bring to my first visit?"],
      source: "knowledge-base",
      skipAiGateway: true,
    };
  }

  const intentFaqMatch = faqAnswers.find((entry) =>
    entry.triggers.some((trigger) => lowercaseMessage.includes(trigger)),
  );
  if (intentFaqMatch) {
    return {
      message: intentFaqMatch.response,
      actions: intentFaqMatch.actions,
      suggestedPrompts: intentFaqMatch.prompts,
      source: "knowledge-base",
      skipAiGateway: true,
    };
  }

  const faqMatch = findBestFaqMatch(tokens, normalizedMessage);
  if (faqMatch) {
    return {
      message: faqMatch.answer,
      actions: [{ label: "Open patient resources", href: "/patient-resources" }],
      suggestedPrompts: faqMatch.followUp,
      source: "knowledge-base",
      skipAiGateway: true,
    };
  }

  const matches = findRelevantPages(tokens, 3);
  if (matches.length > 0) {
    const topMatch = matches[0];
    const summary = buildPageSummary(topMatch.path);
    if (summary) {
      return {
        message: `Here’s what we say on the site: ${summary}`,
        actions: matches.map((entry) => ({
          label: entry.title.split("|")[0]?.trim() || entry.path,
          href: entry.path,
        })),
        suggestedPrompts: quickStartPrompts,
        source: "knowledge-base",
      };
    }

    return {
      message:
        `Based on your question, these pages may help: ${currentPage?.title ?? "our website resources"}.`,
      actions: matches.map((entry) => ({
        label: entry.title.split("|")[0]?.trim() || entry.path,
        href: entry.path,
      })),
      suggestedPrompts: quickStartPrompts,
      source: "knowledge-base",
    };
  }

  return {
    message:
      "I can help with scheduling, services, office info, and insurance questions. If you can share a bit more detail, I can answer directly right away.",
    actions: buildSuggestedActions(lowercaseMessage, true),
    suggestedPrompts: quickStartPrompts,
    source: "knowledge-base",
  };
}

async function callGateway(
  message: string,
  pathname: string,
  fallback: ChatResponse,
  history: readonly {
    readonly role: "user" | "assistant";
    readonly content: string;
  }[],
): Promise<ChatResponse | null> {
  if (!resolveAIGatewayEnabled() || !resolveAIGatewayApiKey()) {
    return null;
  }

  const model = resolveAIGatewayModel();
  const apiKey = resolveAIGatewayApiKey();
  const endpoint = resolveAIGatewayEndpoint();
  const context = `
Practice name: Dr. Christopher B. Wong, DDS
Practice location: ${officeInfo.name}, ${officeInfo.address.line1}, ${officeInfo.address.city}, ${officeInfo.address.region}
Primary phone: ${officeInfo.phone}
Email: ${officeInfo.email}
Current page: ${pathname}
Top matching practice details:
${findRelevantPages(tokenize(message), 4)
  .map((entry) => `${entry.path} — ${buildPageSummary(entry.path)}`)
  .join("\n")}
Known pages:
${pageKnowledge
  .filter((entry) => entry.indexable)
  .slice(0, 20)
  .map((entry) => `${entry.path}: ${entry.title}`)
  .join("\n")}
Shared FAQs:
${faqItems
  .slice(0, 6)
  .map((item) => `${item.question} — ${item.answer}`)
  .join("\n")}
Current context suggestions:
${quickStartPrompts.join("\n")}
Fallback response:
${JSON.stringify(fallback)}
`.trim();

  const systemPrompt = `You are a helpful and concise assistant for a dental practice website.
Answer the user directly, using only the provided context and practice knowledge.
Return a strict JSON object with message, actions, suggestedPrompts, and source:'llm'.
Keep the message practical, specific, and no more than 3 short sentences.
If you can answer directly from the knowledge context, do so instead of suggesting only links.`;

  const recentHistory = safeGatewayHistory(history);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        messages: [
          { role: "system", content: `${systemPrompt}\nContext:\n${context}` },
          ...recentHistory.map((entry) => ({
            role: entry.role,
            content: entry.content,
          })),
          {
            role: "user",
            content: `User asked: "${message}"`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
        };
      }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      return null;
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(content);
    } catch {
      return null;
    }

    const parsed = sanitizeChatResponse(parsedJson);
    if (!parsed.message) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = chatRequestSchema.safeParse(body as ChatRequest);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "I didn't catch that—please send your question again." },
        { status: 400 },
      );
    }

    const normalizedPath = normalizePath(parsed.data.pathname ?? "/");
    const knowledgeReply = buildKnowledgeReply(
      parsed.data.message,
      normalizedPath,
    );
    const llmReply = knowledgeReply.skipAiGateway
      ? null
      : await callGateway(
          parsed.data.message,
          normalizedPath,
          knowledgeReply,
          parsed.data.history ?? [],
        );
    const finalReply = llmReply ?? knowledgeReply;

    return NextResponse.json(
      {
        message: finalReply.message,
        actions: finalReply.actions,
        suggestedPrompts: finalReply.suggestedPrompts,
        source: finalReply.source,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "I’m having trouble answering right now. Please try again." },
      { status: 500 },
    );
  }
}
