/**
 * Static source guards for the mobile-UX improvements.
 *
 * Fast, browser-free regression gate (same spirit as design-system.test.ts):
 * it asserts the invariants behind each mobile fix so they can't silently
 * regress. Runtime behavior (computed font-size, touch-target boxes, overlap,
 * CTA flow) is covered separately by the Playwright mobile suite.
 *
 * Usage: node scripts/mobile-ux-source.test.mjs
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
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

// 3. Funnel submit nav stays in document flow so it cannot cover fields.
assert(
  "AppointmentForm: funnel submit nav is non-sticky + safe-area",
  !/(?:sticky|fixed) bottom-0/.test(apptForm) &&
    /pb-\[calc\(env\(safe-area-inset-bottom\)/.test(apptForm),
  "funnel nav must stay in normal flow and keep safe-area bottom padding",
);

// 3b. Keep the funnel section free from accidental horizontal overflow.
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

// 9. The homepage review ribbon's only control (to /testimonials) is a full
// pill button (btn = min-h-12).
const homeSections = read("client/src/components/home/HomeSections.tsx");
assert(
  "Home review ribbon: reviews link has a >=44px hit area",
  /href="\/testimonials"\s+className="btn\b/.test(homeSections),
  "the review-ribbon link to /testimonials should use the btn class (min-h-12)",
);

// 10. Footer review/social links have a >=44px hit area.
const footer = read("client/src/components/layout/Footer.tsx");
assert(
  "Footer.tsx: review and social links have a >=44px hit area",
  /officeInfo\.reviewUrl[\s\S]{0,260}min-h-11/.test(footer) &&
    /officeInfo\.socialMedia\.instagram[\s\S]{0,260}min-h-11/.test(footer),
  "footer review and Instagram links should keep min-h-11",
);

// 11. The analytics consent banner is removed entirely (no pop-up).
const bannerPath = join(root, "client/src/components/common/AnalyticsConsentBanner.tsx");
const bannerGone = !existsSync(bannerPath);
const shellNoBanner = !read("client/src/AppPageShell.tsx").includes("AnalyticsConsentBanner");
const appNoBanner = !read("client/src/App.tsx").includes("AnalyticsConsentBanner");
assert(
  "AnalyticsConsentBanner: removed (no consent pop-up)",
  bannerGone && shellNoBanner && appNoBanner,
  "component file must be deleted and not referenced by AppPageShell/App",
);
// 11b. Analytics remains available without a banner, honors a stored opt-out,
// and never grants advertising storage by default.
const analyticsSource = read("client/src/lib/analytics.ts");
const layoutSource = read("app/layout.tsx");
assert(
  "analytics: enabled by default and stored opt-out is honored",
  /hasAnalyticsConsent\(\): boolean \{[\s\S]{0,180}getAnalyticsConsentState\(\) !== "denied"/.test(
    analyticsSource,
  ),
);
assert(
  "layout: consent defaults from stored analytics choice with ads denied",
  /analyticsConsent = storedAnalyticsConsent === 'denied' \? 'denied' : 'granted'/.test(
    layoutSource,
  ) &&
    /consent', 'default', \{[\s\S]{0,220}ad_storage: 'denied'[\s\S]{0,220}analytics_storage: analyticsConsent/.test(
      layoutSource,
    ),
);

// 12. Contact API forwards to the office inbox (no silent lead drop).
const contactRoute = read("app/api/contact/route.ts");
assert(
  "api/contact: forwards to Formspree office inbox",
  contactRoute.includes("getPublicFormspreeEndpoint") &&
    /postContactToFormspree\(/.test(contactRoute),
);

// 13. dental-veneers never pulls in framer-motion (quarantined to /analytics).
// Since the 2026-10-16 redesign the page has no JS animation at all (CSS-only
// motion), so the motion-lite stub import is no longer required.
const veneers = read("client/src/pages/DentalVeneers.tsx");
assert(
  "DentalVeneers: does not import framer-motion",
  !/from "framer-motion"/.test(veneers),
);

// 14. Keyboard users can bypass repeated navigation without showing the link
// until it receives focus.
const shell = read("client/src/AppPageShell.tsx");
assert(
  "AppPageShell: accessible skip-to-content link",
  shell.includes('data-testid="skip-to-content"') &&
    shell.includes("Skip to main content") &&
    shell.includes('href="#main-content"') &&
    shell.includes('id="main-content"'),
  "the shell must include a focus-only skip link and matching main target",
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

// 17. The mobile navigation is exposed as a modal surface and its scrollable
// panel clears the iOS home indicator. Runtime focus entry/return is covered by
// the Playwright navigation spec.
const header = read("client/src/components/layout/Header.tsx");
assert(
  "Header: mobile navigation has modal dialog semantics",
  /id="mobile-nav"[\s\S]{0,360}(?=[\s\S]*?role="dialog")(?=[\s\S]*?aria-modal="true")/.test(
    header,
  ),
  "#mobile-nav must declare role='dialog' and aria-modal='true'",
);
assert(
  "Header: mobile navigation panel has safe-area bottom padding",
  /id="mobile-nav"[\s\S]{0,4000}(?:pb-\[calc\((?:[\d.]+rem\+)?env\(safe-area-inset-bottom\)|paddingBottom:\s*["'`]calc\(env\(safe-area-inset-bottom\))/.test(
    header,
  ),
  "the open mobile-navigation surface must include env(safe-area-inset-bottom) in its bottom padding",
);

// 18. The homepage routes visitors by reason for visit with compact, single-
// action care-finder cards (icon-led, no photos, no stacked double buttons),
// while the complete Services catalog keeps ServiceCard's default image
// treatment.
const home = read("client/src/pages/Home.tsx");
const services = read("client/src/pages/Services.tsx");
const careFinderSource =
  homeSections.match(/export function CareFinder\(\)[\s\S]*?\n}\n/)?.[0] ?? "";
assert(
  "Home: services entry point is the compact CareFinder",
  home.includes("<CareFinder />") && !home.includes("<ServiceCard") && careFinderSource.length > 0,
  "the homepage must use the CareFinder instead of stacked ServiceCards",
);
assert(
  "CareFinder: each care path is one link with a >=44px hit area and no images",
  /careFinder\.map/.test(careFinderSource) &&
    /<Link[\s\S]{0,200}className="card card-lift group flex h-full flex-col gap-4 p-4/.test(careFinderSource) &&
    !/<Image\b|<img\b/.test(careFinderSource),
  "care-finder links must stay single-action, image-free, and at least 44px tall",
);
assert(
  "Services: catalog ServiceCards keep the default image visual",
  /<ServiceCard\b(?=[^>]*\bservice=\{service\})[^>]*\/>/.test(services) &&
    !/<ServiceCard[^>]*visual=/.test(services),
  "the Services catalog must not opt into an icon visual",
);

// 19. On phones the appointment form must start near the top of /schedule:
// no back link or oversized emergency banner stacked above it.
const funnelTop = funnelSection.slice(0, funnelSection.indexOf("<AppointmentForm"));
assert(
  "Schedule: nothing heavy is stacked above the appointment form",
  !funnelTop.includes("Back to home") &&
    !funnelTop.includes("bg-rose-600") &&
    funnelTop.includes("text-3xl font-bold") &&
    funnelTop.includes("pt-6"),
  "keep the /schedule header compact so step 1 of the form is visible on a phone",
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
