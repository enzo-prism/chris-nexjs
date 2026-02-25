const fs = require("fs");

const appSource = fs.readFileSync("client/src/App.tsx", "utf8");
const seoSource = fs.readFileSync("shared/seo.ts", "utf8");

const routeRegex = /<Route\s+path="([^"]+)"/g;
const seoRegex = /"(\/[^"]*)"\s*:\s*\{/g;

const routes = new Set();
let match;
while ((match = routeRegex.exec(appSource))) {
  const path = match[1];
  if (!path.includes(":")) routes.add(path);
}

const seoPaths = new Set();
while ((match = seoRegex.exec(seoSource))) {
  seoPaths.add(match[1]);
}

const missing = [...routes].filter((path) => !seoPaths.has(path)).sort();

if (missing.length) {
  console.error("Missing seoByPath entries:", missing.join(", "));
  process.exit(1);
}

console.log("seoByPath covers all static routes.");
