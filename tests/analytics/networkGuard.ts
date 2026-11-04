import type { BrowserContext } from "@playwright/test";
import { isBlockedGoogleMeasurementUrl } from "./googleHosts";

export const APP_MARKER = '[data-testid="skip-to-content"]';

export const LOOKALIKE_HOSTS = [
  "chriswongdds.com.evil.com",
  "evilchriswongdds.com",
] as const;

const PRODUCTION_HOSTS = ["chriswongdds.com", "www.chriswongdds.com"] as const;

const SERVED_ALIASES = new Set<string>([
  ...PRODUCTION_HOSTS,
  ...LOOKALIKE_HOSTS,
]);

export const ALLOWED_WWW_THIRD_PARTY_HOSTS = [
  "www.googletagmanager.com",
  "static.hotjar.com",
] as const;

export type RequestDisposition = "first-party" | "stubbed" | "websocket-stubbed";

export type RecordedRequest = {
  readonly url: string;
  readonly hostname: string;
  readonly disposition: RequestDisposition;
  readonly kind: "document" | "script" | "xhr" | "websocket" | "other";
};

export function localOrigin(baseURL: string | undefined): URL {
  return new URL(baseURL?.trim() || "http://localhost:3211");
}

export function originForHost(local: URL, hostname: string): string {
  const port = local.port || (local.protocol === "https:" ? "443" : "80");
  return `http://${hostname}:${port}`;
}

export function isHotjarHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === "hotjar.com" ||
    host.endsWith(".hotjar.com") ||
    host.endsWith(".hotjar.io")
  );
}

export function isLocalServerHost(hostname: string, local: URL): boolean {
  const host = hostname.toLowerCase();
  return (
    host === local.hostname.toLowerCase() ||
    host === "localhost" ||
    host === "127.0.0.1"
  );
}

export function isFirstPartyHost(hostname: string, local: URL): boolean {
  const host = hostname.toLowerCase();
  return isLocalServerHost(host, local) || SERVED_ALIASES.has(host);
}

export function rewriteToLocal(url: URL, local: URL): string {
  const rewritten = new URL(url.toString());
  rewritten.protocol = local.protocol;
  rewritten.hostname = local.hostname;
  rewritten.port = local.port;
  return rewritten.toString();
}

function requestKind(
  resourceType: string,
): RecordedRequest["kind"] {
  if (resourceType === "document") return "document";
  if (resourceType === "script") return "script";
  if (resourceType === "xhr" || resourceType === "fetch") return "xhr";
  if (resourceType === "websocket") return "websocket";
  return "other";
}

function stubPayload(url: URL): {
  status: number;
  contentType: string;
  body: string;
} {
  const host = url.hostname.toLowerCase();
  const path = url.pathname;
  if (
    path.includes("/gtag/js") ||
    path.endsWith(".js") ||
    isHotjarHost(host) ||
    host.includes("vercel-scripts")
  ) {
    return {
      status: 200,
      contentType: "application/javascript",
      body: "/* synthetic third-party stub — no live collect */",
    };
  }
  return { status: 204, contentType: "text/plain", body: "" };
}

export type NetworkLedger = {
  readonly records: RecordedRequest[];
  readonly stubbed: RecordedRequest[];
  readonly firstParty: RecordedRequest[];
  readonly hotjar: RecordedRequest[];
  readonly gtagScript: RecordedRequest[];
  readonly googleMeasurement: RecordedRequest[];
};

function view(records: RecordedRequest[]): NetworkLedger {
  return {
    records,
    get stubbed() {
      return records.filter(
        (item) =>
          item.disposition === "stubbed" ||
          item.disposition === "websocket-stubbed",
      );
    },
    get firstParty() {
      return records.filter((item) => item.disposition === "first-party");
    },
    get hotjar() {
      return records.filter((item) => isHotjarHost(item.hostname));
    },
    get gtagScript() {
      return records.filter((item) => item.url.includes("googletagmanager.com/gtag/js"));
    },
    get googleMeasurement() {
      return records.filter((item) => isBlockedGoogleMeasurementUrl(item.url));
    },
  };
}

export async function installDefaultDeny(
  context: BrowserContext,
  local: URL,
): Promise<NetworkLedger> {
  const records: RecordedRequest[] = [];

  await context.routeWebSocket(/.*/, (ws) => {
    let hostname = "";
    try {
      hostname = new URL(ws.url()).hostname.toLowerCase();
    } catch {
      hostname = "";
    }
    if (isFirstPartyHost(hostname, local)) {
      records.push({
        url: ws.url(),
        hostname,
        disposition: "first-party",
        kind: "websocket",
      });
      ws.connectToServer();
      return;
    }
    records.push({
      url: ws.url(),
      hostname,
      disposition: "websocket-stubbed",
      kind: "websocket",
    });
    void ws.close();
  });

  await context.route("**/*", async (route) => {
    const rawUrl = route.request().url();
    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      records.push({
        url: rawUrl,
        hostname: "",
        disposition: "stubbed",
        kind: "other",
      });
      await route.abort();
      return;
    }

    const hostname = parsed.hostname.toLowerCase();
    const kind = requestKind(route.request().resourceType());

    if (isFirstPartyHost(hostname, local)) {
      records.push({
        url: rawUrl,
        hostname,
        disposition: "first-party",
        kind,
      });
      if (!isLocalServerHost(hostname, local)) {
        const response = await route.fetch({
          url: rewriteToLocal(parsed, local),
          maxRedirects: 0,
        });
        await route.fulfill({ response });
        return;
      }
      await route.continue();
      return;
    }

    records.push({
      url: rawUrl,
      hostname,
      disposition: "stubbed",
      kind,
    });
    const stub = stubPayload(parsed);
    await route.fulfill({
      status: stub.status,
      contentType: stub.contentType,
      body: stub.body,
    });
  });

  return view(records);
}

export function summarizeLedger(ledger: NetworkLedger): {
  stubbed: string[];
  stubbedHosts: string[];
  hotjar: string[];
  gtagScript: string[];
  googleMeasurement: string[];
} {
  return {
    stubbed: ledger.stubbed.map((item) => item.url),
    stubbedHosts: [...new Set(ledger.stubbed.map((item) => item.hostname))],
    hotjar: ledger.hotjar.map((item) => item.url),
    gtagScript: ledger.gtagScript.map((item) => item.url),
    googleMeasurement: ledger.googleMeasurement.map((item) => item.url),
  };
}
