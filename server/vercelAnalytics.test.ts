import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { NextRequest } from "next/server";
import {
  canSendVercelServerAnalytics,
  requestHostname,
  trackVercelServerEvent,
} from "./vercelAnalytics";

function requestForHost(
  hostname: string,
  extraHeaders: Record<string, string> = {},
): NextRequest {
  return new NextRequest(`https://${hostname}/api/contact`, {
    headers: {
      host: hostname,
      ...extraHeaders,
    },
  });
}

describe("requestHostname", () => {
  it("prefers Host over x-forwarded-host", () => {
    const request = requestForHost("chris-wong-dds-git-foo.vercel.app", {
      "x-forwarded-host": "www.chriswongdds.com",
    });
    assert.equal(requestHostname(request), "chris-wong-dds-git-foo.vercel.app");
  });
});

describe("canSendVercelServerAnalytics", () => {
  const previousUrl = process.env.VERCEL_URL;
  const previousEndpoint = process.env.VERCEL_WEB_ANALYTICS_ENDPOINT;

  afterEach(() => {
    if (previousUrl === undefined) delete process.env.VERCEL_URL;
    else process.env.VERCEL_URL = previousUrl;
    if (previousEndpoint === undefined) {
      delete process.env.VERCEL_WEB_ANALYTICS_ENDPOINT;
    } else {
      process.env.VERCEL_WEB_ANALYTICS_ENDPOINT = previousEndpoint;
    }
  });

  it("ignores VERCEL_URL and lets the request host decide", async () => {
    process.env.VERCEL_URL = "chris-wong-dds-git-foo.vercel.app";
    delete process.env.VERCEL_WEB_ANALYTICS_ENDPOINT;

    assert.equal(
      canSendVercelServerAnalytics(
        requestForHost("chris-wong-dds-git-foo.vercel.app"),
      ),
      false,
    );
    assert.equal(
      canSendVercelServerAnalytics(requestForHost("localhost")),
      false,
    );
    assert.equal(
      canSendVercelServerAnalytics(requestForHost("www.chriswongdds.com")),
      true,
    );

    await trackVercelServerEvent(
      requestForHost("chris-wong-dds-git-foo.vercel.app"),
      "contact_form_submit",
      { page_path: "/contact" },
    );
  });
});
