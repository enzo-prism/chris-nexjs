import { type FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Loader2,
  MessageCircleMore,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

type ChatAction = {
  readonly label: string;
  readonly href: string;
  readonly external?: boolean;
};

type ApiResponse = {
  readonly message: string;
  readonly actions?: readonly ChatAction[];
  readonly suggestedPrompts?: readonly string[];
  readonly source?: "knowledge-base" | "llm";
};

type ChatMessage = {
  readonly id: string;
  readonly role: "user" | "assistant";
  readonly content: string;
  readonly source?: "knowledge-base" | "llm";
  readonly actions?: readonly ChatAction[];
  readonly suggestedPrompts?: readonly string[];
};

type ChatHistoryMessage = {
  readonly role: "user" | "assistant";
  readonly content: string;
};

const initialWelcomeMessage: ApiResponse = {
  message:
    "Hi — I'm the Practice Assistant. Ask me about our services, hours, location, or how to book.",
  actions: [
    { label: "Book an appointment", href: "/schedule#appointment" },
    { label: "Call office", href: "tel:+16503266319", external: true },
    { label: "Contact page", href: "/contact" },
  ],
  suggestedPrompts: [
    "What services do you offer?",
    "Can I book online?",
    "What are your office hours?",
    "Do you take emergencies?",
  ],
};

function isExternalHref(href: string): boolean {
  return href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");
}

export default function PracticeAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<readonly ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content: initialWelcomeMessage.message,
      actions: initialWelcomeMessage.actions,
      suggestedPrompts: initialWelcomeMessage.suggestedPrompts,
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendQuestion(payload: string) {
    const nextQuestion = payload.trim();
    if (!nextQuestion) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: nextQuestion,
    };
    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setIsLoading(true);

    const history: readonly ChatHistoryMessage[] = messages
      .filter((message) => message.content.trim().length > 0)
      .slice(-7)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }))
      .concat({ role: "user", content: nextQuestion });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: nextQuestion,
          pathname: window.location.pathname,
          history,
        }),
      });

      const payload = (await response.json()) as ApiResponse;
      if (!response.ok || typeof payload?.message !== "string") {
        throw new Error("invalid payload");
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: payload.message,
          source: payload.source,
          actions: payload.actions ?? [],
          suggestedPrompts: payload.suggestedPrompts ?? [],
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "I'm having trouble responding just now. You can still use the quick actions or call our office directly.",
          actions: [
            { label: "Book appointment", href: "/schedule#appointment" },
            { label: "Call office", href: "tel:+16503266319", external: true },
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;
    void sendQuestion(question);
  }

  function handlePromptClick(prompt: string) {
    void sendQuestion(prompt);
  }

  const lastAssistantMessage = [...messages].reverse().find((message) => message.role === "assistant");

  return (
    <div className="fixed right-4 bottom-4 z-[60]">
      {isOpen ? (
        <Card className="flex h-[560px] w-[360px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden border bg-background/95 shadow-2xl backdrop-blur">
          <div className="border-b border-border bg-muted/40 px-4 py-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/15 text-primary">
                  <MessageCircleMore className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Practice Assistant</p>
                  <p className="text-xs text-muted-foreground">
                    Ask about care, office details, or scheduling
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close chatbot"
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="min-h-0 flex-1 px-4 pt-3" aria-live="polite">
            <div className="flex flex-col gap-3 pb-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    message.role === "user"
                      ? "self-end bg-primary text-primary-foreground"
                      : "self-start border border-border bg-background"
                  }`}
                >
                  <p className="leading-relaxed">{message.content}</p>
                  {message.source ? (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {message.source === "llm" ? "AI-powered response" : "Practice knowledge"}
                    </p>
                  ) : null}
                  {!!message.actions?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.actions.map((action) =>
                        isExternalHref(action.href) ? (
                          <a
                            key={action.label}
                            href={action.href}
                            target={action.external ? "_blank" : undefined}
                            rel={action.external ? "noreferrer" : undefined}
                            className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground transition hover:bg-muted"
                          >
                            {action.label}
                          </a>
                        ) : (
                          <Link
                            key={action.label}
                            href={action.href}
                            className="rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-foreground transition hover:bg-muted"
                          >
                            {action.label}
                          </Link>
                        ),
                      )}
                    </div>
                  ) : null}
                </div>
              ))}

              {isLoading ? (
                <div className="self-start rounded-xl border border-border bg-background px-3 py-2">
                  <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Dr. Wong's team is checking your question...
                  </p>
                </div>
              ) : null}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="border-t border-border p-3">
            {lastAssistantMessage?.suggestedPrompts ? (
              <div className="mb-2 flex flex-wrap gap-2">
                {lastAssistantMessage.suggestedPrompts.map((prompt) => (
                  <Button
                    key={prompt}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handlePromptClick(prompt)}
                    disabled={isLoading}
                    className="h-auto rounded-full px-3 py-1 text-xs"
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={question}
                placeholder="Ask about services, hours, location, scheduling..."
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    if (!isLoading) {
                      void sendQuestion(question);
                    }
                  }
                }}
                className="h-10"
                aria-label="Chat question"
                maxLength={500}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || question.trim().length === 0}
                className="shrink-0"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      ) : (
        <Button
          type="button"
          onClick={() => setIsOpen(true)}
          className="h-12 rounded-full shadow-2xl"
          size="lg"
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          Ask about practice
        </Button>
      )}
    </div>
  );
}
