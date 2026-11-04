import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { transform } from "next/dist/build/swc";
import { getLoaderSWCOptions } from "next/dist/build/swc/options";

const FOLLOW_UP = path.resolve("server/contactFollowUp.ts");
const ROUTE = path.resolve("app/api/contact/route.ts");

const REQUIRED_LOGS = [
  'console.warn("[contact] persist landed")',
  'console.warn("[contact] persist timed out, still pending")',
  'console.error("[contact] persist failed:"',
  'console.error("[contact] persist abandoned")',
  'console.error("[contact] after() follow-up failed:"',
  'console.error("[contact] Failed to deliver contact message:"',
] as const;

function productionCompilerOptions(
  filename: string,
  removeConsole: boolean | { exclude: string[] },
) {
  return getLoaderSWCOptions({
    filename,
    development: false,
    isServer: true,
    pagesDir: undefined,
    appDir: "app",
    isPageFile: false,
    isCacheComponents: false,
    hasReactRefresh: false,
    modularizeImports: undefined,
    optimizeServerReact: true,
    optimizePackageImports: undefined,
    swcPlugins: undefined,
    compilerOptions: { removeConsole },
    jsConfig: { compilerOptions: {} },
    supportedBrowsers: undefined,
    swcCacheDir: undefined,
    relativeFilePathFromRoot: path.relative(process.cwd(), filename),
    serverComponents: false,
    serverReferenceHashSalt: "",
    bundleLayer: undefined,
    esm: true,
    cacheHandlers: undefined,
    useCacheEnabled: false,
    trackDynamicImports: false,
  });
}

async function compile(file: string, removeConsole: boolean | { exclude: string[] }): Promise<string> {
  const options = productionCompilerOptions(file, removeConsole);
  const result = await transform(fs.readFileSync(file, "utf8"), {
    ...options,
    filename: file,
    sourceFileName: file,
  });
  return String(result.code ?? result);
}

async function loadNextConfig(nodeEnv: string): Promise<{
  compiler?: { removeConsole?: unknown };
}> {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = nodeEnv;
  try {
    const href = new URL("../next.config.mjs", import.meta.url).href;
    const loaded = await import(`${href}?nodeEnv=${encodeURIComponent(nodeEnv)}&t=${Date.now()}`);
    return loaded.default as { compiler?: { removeConsole?: unknown } };
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous;
  }
}

async function run(): Promise<void> {
  const prodConfig = await loadNextConfig("production");
  assert.deepEqual(
    prodConfig.compiler?.removeConsole,
    { exclude: ["error", "warn"] },
    "prod compiler.removeConsole must keep error and warn",
  );
  const devConfig = await loadNextConfig("development");
  const devRemove = devConfig.compiler?.removeConsole;
  assert.ok(
    devRemove === false || devRemove === undefined,
    `dev compiler.removeConsole must be false or undefined (${JSON.stringify(devRemove)})`,
  );

  const stripped = `${await compile(FOLLOW_UP, true)}\n${await compile(ROUTE, true)}`;
  for (const line of REQUIRED_LOGS) {
    assert.doesNotMatch(
      stripped,
      new RegExp(line.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      `control: ${line} must be stripped when removeConsole is true`,
    );
  }

  const kept = `${await compile(FOLLOW_UP, { exclude: ["error", "warn"] })}\n${await compile(ROUTE, { exclude: ["error", "warn"] })}`;
  for (const line of REQUIRED_LOGS) {
    assert.match(
      kept,
      new RegExp(line.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      `prod compile must keep ${line}`,
    );
  }
  console.log("Contact prod console compile checks passed.");
}

void run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
