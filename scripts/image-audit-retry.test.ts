import assert from "node:assert/strict";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { describe, it } from "node:test";

import {
  IMAGE_AUDIT_RETRY_ATTEMPTS,
  imageAuditExitCode,
  shouldRetryImageFailure,
  verifyImageUrl,
} from "./image-audit-retry";

const TINY_JPEG = Buffer.from(
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wAAADwABQABBAAB/9k=",
  "base64",
);

assert.equal(
  shouldRetryImageFailure({
    scope: "runtime",
    target: "x",
    reason: "Image request returned status 504",
  }),
  true,
);
assert.equal(
  shouldRetryImageFailure({
    scope: "runtime",
    target: "x",
    reason: "Image request returned status 500",
  }),
  true,
);
assert.equal(
  shouldRetryImageFailure({
    scope: "runtime",
    target: "x",
    reason: "Image request returned status 404",
  }),
  false,
);
assert.equal(
  shouldRetryImageFailure({
    scope: "runtime",
    target: "x",
    reason: "Image request returned status 403",
  }),
  false,
);
assert.equal(
  shouldRetryImageFailure({
    scope: "runtime",
    target: "x",
    reason: "Image request failed: The operation was aborted due to timeout",
  }),
  true,
);

async function withStubServer(
  handler: (request: IncomingMessage, response: ServerResponse) => void,
  run: (url: string) => Promise<void>,
): Promise<void> {
  const server = createServer(handler);
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    throw new Error("stub server did not bind a port");
  }
  const url = `http://127.0.0.1:${address.port}/img.jpg`;
  try {
    await run(url);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}

function sendStatus(response: ServerResponse, status: number): void {
  response.statusCode = status;
  response.setHeader("content-type", "text/plain");
  response.end(`status ${status}`);
}

function sendImage(response: ServerResponse): void {
  response.statusCode = 200;
  response.setHeader("content-type", "image/jpeg");
  response.end(TINY_JPEG);
}

describe("verifyImageUrl stub server", () => {
  it("exits non-zero after a persistent 504 without retrying past 3 attempts", async () => {
    let hits = 0;
    await withStubServer(
      (_request, response) => {
        hits += 1;
        sendStatus(response, 504);
      },
      async (url) => {
        const failure = await Promise.race([
          verifyImageUrl(url),
          new Promise<never>((_, reject) => {
            setTimeout(() => {
              reject(
                new Error(
                  `retry loop exceeded ${IMAGE_AUDIT_RETRY_ATTEMPTS} attempts (hits=${hits})`,
                ),
              );
            }, 5_000);
          }),
        ]);
        assert.ok(failure, "persistent 504 must not be swallowed");
        assert.match(failure.reason, /status 504/);
        assert.equal(hits, IMAGE_AUDIT_RETRY_ATTEMPTS);
        assert.equal(imageAuditExitCode([failure]), 1);
      },
    );
  });

  it("does not retry 4xx", async () => {
    const seen: number[] = [];
    await withStubServer(
      (request, response) => {
        if (request.url?.includes("403")) {
          seen.push(403);
          sendStatus(response, 403);
          return;
        }
        seen.push(404);
        sendStatus(response, 404);
      },
      async (url) => {
        const forbidden = await verifyImageUrl(`${url}?code=403`);
        assert.ok(forbidden);
        assert.match(forbidden.reason, /status 403/);
        const missing = await verifyImageUrl(`${url}?code=404`);
        assert.ok(missing);
        assert.match(missing.reason, /status 404/);
        assert.deepEqual(seen, [403, 404]);
      },
    );
  });

  it("passes after a recovering 5xx", async () => {
    let hits = 0;
    await withStubServer(
      (_request, response) => {
        hits += 1;
        if (hits === 1) {
          sendStatus(response, 504);
          return;
        }
        sendImage(response);
      },
      async (url) => {
        const failure = await verifyImageUrl(url);
        assert.equal(failure, null);
        assert.equal(hits, 2);
      },
    );
  });

  it("stops retrying when a 5xx recovers into a 4xx", async () => {
    const seen: number[] = [];
    await withStubServer(
      (_request, response) => {
        const status = seen.length === 0 ? 500 : 404;
        seen.push(status);
        sendStatus(response, status);
      },
      async (url) => {
        const failure = await verifyImageUrl(url);
        assert.ok(failure);
        assert.match(failure.reason, /status 404/);
        assert.deepEqual(seen, [500, 404]);
      },
    );
  });

  it("keeps recovering 5xx as a zero exit", async () => {
    let hits = 0;
    await withStubServer(
      (_request, response) => {
        hits += 1;
        if (hits < 3) {
          sendStatus(response, hits === 1 ? 502 : 503);
          return;
        }
        sendImage(response);
      },
      async (url) => {
        const failure = await verifyImageUrl(url);
        assert.equal(failure, null);
        assert.equal(hits, 3);
        assert.equal(imageAuditExitCode([failure]), 0);
      },
    );
  });
});
