import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import type { ListenOptions } from "net";
import { getLegacyRedirectPath } from "@shared/redirects";

const app = express();

app.set("trust proxy", true);

const CANONICAL_HOST = "www.chriswongdds.com";
const CANONICAL_BASE = `https://${CANONICAL_HOST}`;

type ListenOptionsWithReusePort = ListenOptions & { reusePort?: boolean };

// Enforce canonical host + protocol and handle legacy slug redirects.
app.use((req: Request, res: Response, next: NextFunction) => {
  const hostHeader = req.get("host") ?? "";
  const hostname = hostHeader.split(":")[0];
  const isProdDomain =
    hostname === "chriswongdds.com" || hostname === CANONICAL_HOST;

  if (!isProdDomain) {
    return next();
  }

  const legacyTarget = getLegacyRedirectPath(req.path);
  const targetPath = legacyTarget ?? req.path;

  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto =
    typeof forwardedProto === "string"
      ? forwardedProto.split(",")[0].trim()
      : req.protocol;
  const needsHttps = proto !== "https";
  const needsWww = hostname !== CANONICAL_HOST;

  if (legacyTarget || needsHttps || needsWww) {
    const query = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
    const [pathWithoutHash, hash] = targetPath.split("#");
    const location = hash
      ? `${CANONICAL_BASE}${pathWithoutHash}${query}#${hash}`
      : `${CANONICAL_BASE}${targetPath}${query}`;
    return res.redirect(301, location);
  }

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(compression());

// Serve static files from public directory
const publicPath = path.resolve(process.cwd(), "public");
app.use(
  express.static(publicPath, {
    maxAge: "1y",
    immutable: true,
    setHeaders(res, filePath) {
      if (
        filePath.endsWith(`${path.sep}robots.txt`) ||
        filePath.endsWith(`${path.sep}llms.txt`)
      ) {
        res.setHeader(
          "Cache-Control",
          "no-store, no-cache, must-revalidate, max-age=0",
        );
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
      }
    },
  }),
);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error(err);
    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = Number(process.env.PORT) || 5000;
  const host = process.env.HOST || "0.0.0.0";
  const reusePortEnabled = process.env.REUSE_PORT_ENABLED === "true";

  const baseListenOptions: ListenOptionsWithReusePort = {
    port,
    host,
  };

  const listenOptions: ListenOptionsWithReusePort = reusePortEnabled
    ? { ...baseListenOptions, reusePort: true }
    : baseListenOptions;

  async function startServer(options: ListenOptionsWithReusePort) {
    await new Promise<void>((resolve, reject) => {
      const onError = (err: NodeJS.ErrnoException) => {
        server.off("listening", onListening);
        reject(err);
      };

      const onListening = () => {
        server.off("error", onError);
        resolve();
      };

      server.once("error", onError);
      server.once("listening", onListening);
      server.listen(options);
    });
  }

  const allowFallback =
    app.get("env") === "development" &&
    process.env.ALLOW_LOCAL_PORT_FALLBACK !== "false";
  const fallbackPort = Number(process.env.DEV_FALLBACK_PORT) || 5050;

  try {
    await startServer(listenOptions);
    log(`serving on http://${host}:${listenOptions.port}`);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (
      err.code === "EADDRINUSE" &&
      allowFallback &&
      fallbackPort !== port
    ) {
      log(
        `port ${port} is already in use locally, retrying on ${fallbackPort}`,
      );
      const fallbackOptions: ListenOptionsWithReusePort = reusePortEnabled
        ? { ...baseListenOptions, port: fallbackPort, reusePort: true }
        : { ...baseListenOptions, port: fallbackPort };
      await startServer(fallbackOptions);
      log(`serving on http://${host}:${fallbackOptions.port}`);
    } else {
      throw error;
    }
  }
})();
