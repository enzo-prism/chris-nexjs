import { after } from "next/server";
import type { InsertContactMessage } from "@shared/schema";
import { getStorage } from "./storage/repository";

export const CONTACT_DB_TIMEOUT_MS = 2_000;
export const CONTACT_DB_ABANDON_MS = 25_000;

const pendingAfterTasksForTests: Promise<void>[] = [];

type WriteOutcome = "landed" | { readonly failed: unknown };

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

const CONTACT_LOG_ERROR_NAMES: ReadonlySet<string> = new Set([
  "Error",
  "TypeError",
  "RangeError",
  "SyntaxError",
  "AbortError",
  "TimeoutError",
  "NeonDbError",
  "ContactInboxRejectedError",
]);

function pickSafeToken(value: unknown, key: string): string | undefined {
  const record = asRecord(value);
  if (!record) return undefined;
  const token = record[key];
  if (typeof token === "number" && Number.isFinite(token)) return String(token);
  if (typeof token === "string" && /^[A-Za-z0-9_]+$/.test(token)) return token;
  return undefined;
}

function pickSqlState(value: unknown): string | undefined {
  const record = asRecord(value);
  if (!record) return undefined;
  const token = record.code;
  const asString =
    typeof token === "number" && Number.isFinite(token)
      ? String(token)
      : typeof token === "string"
        ? token
        : undefined;
  if (asString !== undefined && /^[0-9A-Z]{5}$/.test(asString)) return asString;
  return undefined;
}

export function describeContactLogError(error: unknown): string {
  const record = asRecord(error);
  if (!record) return "unknown";
  const rawName = typeof record.name === "string" ? record.name : "";
  const name = CONTACT_LOG_ERROR_NAMES.has(rawName) ? rawName : "Error";
  const code = pickSqlState(record.cause);
  const constraint =
    pickSafeToken(record.cause, "constraint") ??
    pickSafeToken(record.cause, "constraint_name") ??
    pickSafeToken(record, "constraint") ??
    pickSafeToken(record, "constraint_name");
  return [name, code, constraint].filter(Boolean).join(" ");
}

function settleWrite(write: Promise<unknown>): Promise<WriteOutcome> {
  return write.then(
    () => "landed" as const,
    (error: unknown) => ({ failed: error }),
  );
}

export function runAfterResponse(task: () => void | Promise<void>): void {
  const run = async (): Promise<void> => {
    try {
      await task();
    } catch (error) {
      console.error("[contact] after() follow-up failed:", describeContactLogError(error));
    }
  };
  try {
    after(run);
  } catch (error) {
    console.error("[contact] after() unavailable:", describeContactLogError(error));
    if (process.env.NODE_ENV !== "production") {
      pendingAfterTasksForTests.push(run());
    }
  }
}

export async function flushContactAfterTasksForTests(): Promise<void> {
  const tasks = pendingAfterTasksForTests.splice(0);
  await Promise.all(tasks);
}

export async function persistContactMessageAfterResponse(
  data: InsertContactMessage,
): Promise<void> {
  const storage = await getStorage();
  const write = Promise.resolve(storage.createContactMessage(data));
  let firstTimeoutId: ReturnType<typeof setTimeout> | undefined;
  let abandonTimeoutId: ReturnType<typeof setTimeout> | undefined;
  const firstTimeout = new Promise<"timeout">((resolve) => {
    firstTimeoutId = setTimeout(() => resolve("timeout"), CONTACT_DB_TIMEOUT_MS);
  });
  try {
    const first = await Promise.race([settleWrite(write), firstTimeout]);
    if (first === "landed") {
      console.warn("[contact] persist landed");
      return;
    }
    if (first !== "timeout") {
      console.error("[contact] persist failed:", describeContactLogError(first.failed));
      return;
    }
    console.warn("[contact] persist timed out, still pending");
    const remainingMs = Math.max(0, CONTACT_DB_ABANDON_MS - CONTACT_DB_TIMEOUT_MS);
    const abandoned = new Promise<"abandoned">((resolve) => {
      abandonTimeoutId = setTimeout(() => resolve("abandoned"), remainingMs);
    });
    const late = await Promise.race([settleWrite(write), abandoned]);
    if (late === "landed") {
      console.warn("[contact] persist landed late");
      return;
    }
    if (late === "abandoned") {
      console.error("[contact] persist abandoned");
      void write.then(
        () => {
          console.warn("[contact] persist landed after abandon");
        },
        (error: unknown) => {
          console.error("[contact] persist failed:", describeContactLogError(error));
        },
      );
      return;
    }
    console.error("[contact] persist failed:", describeContactLogError(late.failed));
  } finally {
    if (firstTimeoutId) clearTimeout(firstTimeoutId);
    if (abandonTimeoutId) clearTimeout(abandonTimeoutId);
  }
}
