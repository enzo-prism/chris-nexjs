export type ImageAuditFailure = {
  scope: "source" | "runtime" | "budget";
  target: string;
  reason: string;
};

export const IMAGE_AUDIT_RETRY_ATTEMPTS = 3;
export const IMAGE_AUDIT_RETRY_DELAY_MS = 400;

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function isTransientImageStatus(status: number): boolean {
  return status === 500 || status === 502 || status === 503 || status === 504;
}

export function isTransientImageError(reason: string): boolean {
  return /timeout|timed out/i.test(reason);
}

export function imageAuditAttemptTimeoutMs(): number {
  const raw = process.env.IMAGE_AUDIT_ATTEMPT_TIMEOUT_MS;
  if (raw == null || raw === "") return 45_000;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 45_000;
  return parsed;
}

export function shouldRetryImageFailure(failure: ImageAuditFailure): boolean {
  const statusMatch = /returned status (\d+)/.exec(failure.reason);
  if (statusMatch) {
    const status = Number(statusMatch[1]);
    if (!Number.isInteger(status)) return false;
    if (status >= 400 && status < 500) return false;
    return isTransientImageStatus(status);
  }
  return isTransientImageError(failure.reason);
}

export async function verifyImageUrlOnce(
  url: string,
  timeoutMs = imageAuditAttemptTimeoutMs(),
): Promise<ImageAuditFailure | null> {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        Accept: "image/*,*/*;q=0.8",
        "User-Agent": "chris-nextjs-image-audit/1.0",
      },
    });

    if (response.status >= 400) {
      response.body?.cancel();
      return {
        scope: "runtime",
        target: url,
        reason: `Image request returned status ${response.status}`,
      };
    }

    const contentType = (response.headers.get("content-type") || "").toLowerCase();

    if (contentType.includes("text/html")) {
      response.body?.cancel();
      return {
        scope: "runtime",
        target: url,
        reason: "URL responded with HTML instead of image bytes",
      };
    }

    if (
      contentType &&
      !contentType.startsWith("image/") &&
      !contentType.startsWith("application/octet-stream")
    ) {
      response.body?.cancel();
      return {
        scope: "runtime",
        target: url,
        reason: `Unexpected content-type for image: ${contentType}`,
      };
    }

    const imageBytes = await response.arrayBuffer();
    if (imageBytes.byteLength === 0) {
      return {
        scope: "runtime",
        target: url,
        reason: "Image response contained no bytes",
      };
    }

    return null;
  } catch (error) {
    return {
      scope: "runtime",
      target: url,
      reason: `Image request failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export function imageAuditExitCode(
  failures: readonly (ImageAuditFailure | null)[],
): number {
  return failures.some((failure) => failure !== null) ? 1 : 0;
}

export async function verifyImageUrl(
  url: string,
  options: { readonly timeoutMs?: number } = {},
): Promise<ImageAuditFailure | null> {
  let lastFailure: ImageAuditFailure | null = null;
  const timeoutMs = options.timeoutMs ?? imageAuditAttemptTimeoutMs();

  for (let attempt = 1; attempt <= IMAGE_AUDIT_RETRY_ATTEMPTS; attempt += 1) {
    const failure = await verifyImageUrlOnce(url, timeoutMs);
    if (!failure) return null;
    lastFailure = failure;
    if (!shouldRetryImageFailure(failure) || attempt === IMAGE_AUDIT_RETRY_ATTEMPTS) {
      return failure;
    }
    await delay(IMAGE_AUDIT_RETRY_DELAY_MS * attempt);
  }

  return lastFailure;
}
