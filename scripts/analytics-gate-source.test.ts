import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readRepo(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

describe("analytics host gate wiring", () => {
  it("runs the shared snippet before the inline gtag bootstrap can load", () => {
    const layout = readRepo("app/layout.tsx");
    const guardCall = layout.indexOf("analyticsHostAllowlistGuardSnippet()");
    const gtagScript = layout.indexOf("googletagmanager.com/gtag/js");
    const dataLayer = layout.indexOf("window.dataLayer");

    assert.notEqual(guardCall, -1, "layout must call analyticsHostAllowlistGuardSnippet()");
    assert.ok(
      guardCall < gtagScript && guardCall < dataLayer,
      "the host guard must run before dataLayer or gtag.js",
    );
    assert.match(layout, /from "@shared\/analyticsHosts"/);
  });

  it("installs a no-op window.gtag in the shared snippet before returning", () => {
    const snippet = readRepo("shared/analyticsHosts.ts");
    assert.match(
      snippet,
      /window\.gtag = window\.gtag \|\| function \(\) \{\};/,
    );
    assert.match(snippet, /export function isProductionAnalyticsHost/);
  });

  it("uses the shared helper at every analytics entry point", () => {
    const entryPoints: ReadonlyArray<{ path: string; needle: RegExp }> = [
      {
        path: "client/src/lib/analytics.ts",
        needle: /isAllowedAnalyticsHost\(window\.location\.hostname\)/,
      },
      {
        path: "client/src/components/common/VercelAnalytics.tsx",
        needle: /isAllowedAnalyticsHost\(window\.location\.hostname\)/,
      },
      {
        path: "client/src/components/common/HotjarTracking.tsx",
        needle: /isAllowedAnalyticsHost\(window\.location\.hostname\)/,
      },
      {
        path: "server/vercelAnalytics.ts",
        needle: /canSendServerAnalytics\(|hostnameFromRequestHeaders\(/,
      },
    ];

    for (const { path, needle } of entryPoints) {
      const source = readRepo(path);
      assert.match(source, /from "@shared\/analyticsHosts"/);
      assert.match(source, needle, `${path} must consult the shared host helper`);
    }
  });

  it("keeps the runtime host gate on Ads conversion and SPA page_view", () => {
    assertBareRuntimeGuard(
      "client/src/lib/analytics.ts",
      "trackGoogleAdsConversion",
    );
    assertBareRuntimeGuard(
      "client/src/components/common/GoogleAnalytics.tsx",
      "sendPageView",
    );
  });

  it("rejects Hotjar && false and Vercel setEnabled(true) bypasses", () => {
    const hotjar = readRepo("client/src/components/common/HotjarTracking.tsx");
    assert.match(
      hotjar,
      /if\s*\(\s*!isAllowedAnalyticsHost\(window\.location\.hostname\)\s*\)\s*return/,
    );
    assert.doesNotMatch(
      hotjar,
      /isAllowedAnalyticsHost\(window\.location\.hostname\)\s*&&\s*false/,
    );

    const vercel = readRepo("client/src/components/common/VercelAnalytics.tsx");
    assert.match(
      vercel,
      /setEnabled\(\s*isAllowedAnalyticsHost\(window\.location\.hostname\)\s*\)/,
    );
    assert.doesNotMatch(vercel, /setEnabled\(\s*true\s*\)/);
  });
});

function parseSource(relativePath: string): ts.SourceFile {
  const text = readRepo(relativePath);
  return ts.createSourceFile(
    relativePath,
    text,
    ts.ScriptTarget.Latest,
    true,
    relativePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

function functionName(node: ts.Node): string | undefined {
  if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) {
    return node.name?.text;
  }
  if (ts.isVariableDeclaration(node) && node.name && ts.isIdentifier(node.name)) {
    return node.name.text;
  }
  return undefined;
}

function collectIfTests(root: ts.Node, targetName: string): ts.Expression[] {
  const tests: ts.Expression[] = [];
  const visit = (node: ts.Node, inTarget: boolean): void => {
    const named = functionName(node);
    const nextInTarget = inTarget || named === targetName;
    if (nextInTarget && ts.isIfStatement(node)) {
      tests.push(node.expression);
    }
    ts.forEachChild(node, (child) => visit(child, nextInTarget));
  };
  visit(root, false);
  return tests;
}

function unwrap(expr: ts.Expression): ts.Expression {
  return ts.isParenthesizedExpression(expr) ? unwrap(expr.expression) : expr;
}

function orOperands(expr: ts.Expression): ts.Expression[] {
  const inner = unwrap(expr);
  if (
    ts.isBinaryExpression(inner) &&
    inner.operatorToken.kind === ts.SyntaxKind.BarBarToken
  ) {
    return [...orOperands(inner.left), ...orOperands(inner.right)];
  }
  return [inner];
}

function isBareNotCall(expr: ts.Expression, name: string): boolean {
  const inner = unwrap(expr);
  return (
    ts.isPrefixUnaryExpression(inner) &&
    inner.operator === ts.SyntaxKind.ExclamationToken &&
    ts.isCallExpression(inner.operand) &&
    ts.isIdentifier(inner.operand.expression) &&
    inner.operand.expression.text === name &&
    inner.operand.arguments.length === 0
  );
}

function containsAndFalse(expr: ts.Expression): boolean {
  const inner = unwrap(expr);
  if (
    ts.isBinaryExpression(inner) &&
    inner.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
  ) {
    if (inner.right.kind === ts.SyntaxKind.FalseKeyword) return true;
    if (inner.left.kind === ts.SyntaxKind.FalseKeyword) return true;
    return containsAndFalse(inner.left) || containsAndFalse(inner.right);
  }
  return false;
}

function assertBareRuntimeGuard(relativePath: string, targetName: string): void {
  const source = parseSource(relativePath);
  const tests = collectIfTests(source, targetName);
  assert.ok(tests.length > 0, `${relativePath} ${targetName} has no if-guards`);
  const first = tests[0];
  const operands = orOperands(first);
  assert.ok(
    operands.some((operand) => isBareNotCall(operand, "isAnalyticsRuntimeEnabled")),
    `${relativePath} ${targetName} must have a top-level !isAnalyticsRuntimeEnabled() operand`,
  );
  assert.equal(
    operands.some((operand) => containsAndFalse(operand)),
    false,
    `${relativePath} ${targetName} must not wrap the host gate in && false`,
  );
}
