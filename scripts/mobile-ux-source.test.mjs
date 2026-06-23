/**
 * Static source guards for the mobile-UX improvements.
 *
 * Fast, browser-free regression gate (same spirit as design-system.test.ts):
 * it asserts the invariants behind each mobile fix so they can't silently
 * regress. Runtime behavior (computed font-size, touch-target boxes, overlap,
 * sticky CTA) is covered separately by the Playwright mobile suite.
 *
 * Usage: node scripts/mobile-ux-source.test.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => readFileSync(join(root, rel), "utf8");

let failures = 0;
const checks = [];
function assert(name, condition, detail = "") {
  checks.push({ name, ok: Boolean(condition), detail });
  if (!condition) failures += 1;
}

// 1. Form field primitives are >= 16px on mobile (stops iOS focus-zoom).
for (const file of [
  "client/src/components/ui/input.tsx",
  "client/src/components/ui/textarea.tsx",
  "client/src/components/ui/select.tsx",
]) {
  const src = read(file);
  assert(
    `${file}: field font-size is text-base on mobile`,
    src.includes("text-base md:text-sm"),
    "expected 'text-base md:text-sm' on the field element",
  );
}

// 2. Funnel input helpers are >= 16px on mobile.
const apptForm = read("client/src/components/forms/AppointmentForm.tsx");
assert(
  "AppointmentForm: funnel inputs are text-base on mobile",
  !/px-4 text-\[15px\]/.test(apptForm) && apptForm.includes("text-base md:text-[15px]"),
  "funnel input/textarea helpers should use 'text-base md:text-[15px]'",
);

// 3. Funnel submit nav is sticky with safe-area padding on mobile.
assert(
  "AppointmentForm: funnel submit nav is sticky + safe-area",
  /sticky bottom-0[^"]*env\(safe-area-inset-bottom\)/.test(apptForm),
  "funnel nav should be 'sticky bottom-0 ... pb-[calc(env(safe-area-inset-bottom)...]'",
);

// 3b. The funnel section must not be `overflow-hidden` (it would become the
// sticky containing block and defeat the `sticky bottom-0` submit CTA).
const funnelSection = read("client/src/components/sections/ScheduleRequestFunnel.tsx");
assert(
  "ScheduleRequestFunnel: appointment section not overflow-hidden (uses overflow-x-clip)",
  funnelSection.includes('className="relative overflow-x-clip') &&
    !funnelSection.includes('className="relative overflow-hidden'),
  "the <section id='appointment'> className must use overflow-x-clip, not overflow-hidden",
);

// 4. Default scheduling mode is the shorter first-available path.
assert(
  "AppointmentForm: default schedulingMode is first_available",
  /schedulingMode:\s*"first_available"/.test(apptForm),
);

// 5. enterKeyHint present on funnel contact inputs.
assert(
  "AppointmentForm: enterKeyHint wired on inputs",
  (apptForm.match(/enterKeyHint=/g) ?? []).length >= 4,
);

// 6. Contact form email has inputMode + autocomplete + enterKeyHint.
const contactForm = read("client/src/components/forms/ContactForm.tsx");
assert(
  "ContactForm: email has inputMode='email'",
  /type="email"[\s\S]{0,120}inputMode="email"/.test(contactForm),
);
assert(
  "ContactForm: enterKeyHint wired",
  contactForm.includes("enterKeyHint="),
);

// 7. Newsletter email has mobile keyboard attrs and >=16px.
const newsletter = read("client/src/components/forms/NewsletterForm.tsx");
assert(
  "NewsletterForm: email inputMode + autoComplete",
  newsletter.includes('inputMode="email"') && newsletter.includes('autoComplete="email"'),
);
assert(
  "NewsletterForm: email is text-base on mobile",
  newsletter.includes("text-base md:text-sm"),
);

// 8. Icon button variant meets the 44px target.
const button = read("client/src/components/ui/button.tsx");
assert(
  "button.tsx: icon size is h-11 w-11 (44px)",
  /icon:\s*"h-11 w-11"/.test(button),
);

// 9. Carousel dots have a >=44px hit area.
const home = read("client/src/pages/Home.tsx");
assert(
  "Home.tsx: carousel dots have h-11 w-11 hit area",
  /data-testid="testimonial-dot"[\s\S]{0,260}h-11 w-11/.test(home),
);

// 10. Footer social links have a >=44px hit area.
const footer = read("client/src/components/layout/Footer.tsx");
assert(
  "Footer.tsx: social links have h-11 w-11 hit area",
  /h-11 w-11[\s\S]{0,80}aria-label=\{social\.label\}/.test(footer) ||
    /social\.label[\s\S]{0,200}h-11 w-11/.test(footer) ||
    footer.includes("h-11 w-11"),
);

// 11. Consent banner sits above the MobileActionBar on mobile (default route).
const consent = read("client/src/components/common/AnalyticsConsentBanner.tsx");
assert(
  "AnalyticsConsentBanner: default branch offset above action bar",
  /bottom-\[calc\(3\.25rem\+env\(safe-area-inset-bottom\)[^\]]*\)\][^"]*md:bottom-4/.test(consent),
);

// 12. Contact API forwards to the office inbox (no silent lead drop).
const contactRoute = read("app/api/contact/route.ts");
assert(
  "api/contact: forwards to Formspree office inbox",
  contactRoute.includes("getPublicFormspreeEndpoint") &&
    /postContactToFormspree\(/.test(contactRoute),
);

// 13. dental-veneers uses the no-op motion stub, not framer-motion.
const veneers = read("client/src/pages/DentalVeneers.tsx");
assert(
  "DentalVeneers: imports motion from @/lib/motion-lite",
  veneers.includes('from "@/lib/motion-lite"') &&
    !/from "framer-motion"/.test(veneers),
);

// 14. Skip-to-content link + main landmark id.
const shell = read("client/src/AppPageShell.tsx");
assert(
  "AppPageShell: skip-to-content link + #main-content",
  shell.includes('data-testid="skip-to-content"') &&
    shell.includes('href="#main-content"') &&
    shell.includes('id="main-content"'),
);

// 15. Global horizontal-overflow guard.
const globals = read("app/globals.css");
assert(
  "globals.css: overflow-x guard (clip)",
  /overflow-x:\s*clip/.test(globals),
);

// 16. No landing-page H1 starts its ramp at text-4xl without a text-3xl sm: base.
const pagesDir = "client/src/pages";
const offenders = [];
for (const file of readdirSync(join(root, pagesDir)).filter((f) => f.endsWith(".tsx"))) {
  const src = read(join(pagesDir, file));
  // match `text-4xl md:text-5xl` NOT preceded by `sm:`
  const re = /(^|[^:])text-4xl md:text-5xl/g;
  if (re.test(src)) offenders.push(file);
}
assert(
  "pages/: no H1 ramp starts at text-4xl without text-3xl sm: base",
  offenders.length === 0,
  offenders.length ? `offending files: ${offenders.join(", ")}` : "",
);

// ---- report ----
for (const c of checks) {
  console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.name}${c.ok || !c.detail ? "" : `\n        ↳ ${c.detail}`}`);
}
console.log(`\n${checks.length - failures}/${checks.length} checks passed.`);
if (failures > 0) {
  console.error(`\n✖ ${failures} mobile-UX source guard(s) failed.`);
  process.exit(1);
}
console.log("\n✔ All mobile-UX source guards passed.");
