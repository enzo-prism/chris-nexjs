type ScheduledTimer = {
  readonly id: number;
  readonly due: number;
  readonly fn: () => void;
};

export function installFakeTimers(): {
  tick(ms: number): Promise<void>;
  restore(): void;
} {
  let now = 0;
  let nextId = 1;
  const timers = new Map<number, ScheduledTimer>();
  const originalSetTimeout = globalThis.setTimeout;
  const originalClearTimeout = globalThis.clearTimeout;
  const originalDateNow = Date.now.bind(Date);
  const originalAbortTimeout = AbortSignal.timeout.bind(AbortSignal);
  AbortSignal.timeout = () => new AbortController().signal;

  globalThis.setTimeout = ((fn: () => void, ms = 0) => {
    const id = nextId;
    nextId += 1;
    timers.set(id, { id, due: now + Number(ms), fn });
    const handle: {
      unref(): unknown;
      ref(): unknown;
      valueOf(): number;
      [Symbol.toPrimitive](): number;
    } = {
      unref() {
        return handle;
      },
      ref() {
        return handle;
      },
      valueOf() {
        return id;
      },
      [Symbol.toPrimitive]() {
        return id;
      },
    };
    return handle as unknown as ReturnType<typeof setTimeout>;
  }) as typeof setTimeout;
  globalThis.clearTimeout = ((id: ReturnType<typeof setTimeout>) => {
    timers.delete(Number(id));
  }) as typeof clearTimeout;
  Date.now = () => now;

  return {
    async tick(ms: number): Promise<void> {
      const target = now + ms;
      const callbackErrors: unknown[] = [];
      while (true) {
        const due = [...timers.values()]
          .filter((timer) => timer.due <= target)
          .sort((left, right) => left.due - right.due);
        if (due.length === 0) {
          now = target;
          break;
        }
        const next = due[0];
        now = next.due;
        timers.delete(next.id);
        try {
          next.fn();
        } catch (error) {
          callbackErrors.push(error);
        }
        await Promise.resolve();
        await Promise.resolve();
      }
      if (callbackErrors.length === 1) throw callbackErrors[0];
      if (callbackErrors.length > 1) {
        throw new AggregateError(callbackErrors, "fake timer callbacks threw");
      }
    },
    restore(): void {
      globalThis.setTimeout = originalSetTimeout;
      globalThis.clearTimeout = originalClearTimeout;
      Date.now = originalDateNow;
      AbortSignal.timeout = originalAbortTimeout;
    },
  };
}

export function hasStillPending(lines: readonly string[]): boolean {
  return lines.some((line) => line.includes("[contact] persist timed out, still pending"));
}

export async function yieldMicrotasks(times = 8): Promise<void> {
  for (let i = 0; i < times; i += 1) {
    await Promise.resolve();
  }
}
