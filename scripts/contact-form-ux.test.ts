import assert from "node:assert/strict";
import fs from "node:fs";

const formSource = fs.readFileSync(
  "client/src/components/forms/ContactForm.tsx",
  "utf8",
);
const pageSource = fs.readFileSync("client/src/pages/Contact.tsx", "utf8");

assert.match(formSource, /contactFormSchema = insertContactMessageSchema\.extend/);
assert.match(formSource, /mode: "onBlur"/);
assert.match(formSource, /role="alert"/);
assert.match(formSource, /Your entries are still here/);
assert.match(formSource, /Try again/);
assert.match(formSource, /aria-invalid=\{privacyError\}/);
assert.match(formSource, /privacy policy/);
assert.match(formSource, /HIPAA notice/);
assert.match(formSource, /Sending message/);
assert.match(formSource, /Message sent\. Opening your confirmation/);
assert.match(formSource, /window\.location\.assign\("\/thank-you"\)/);

assert.match(pageSource, /Request an appointment/);
assert.match(pageSource, /Send a general question/);
assert.match(pageSource, /Call now/);
assert.match(pageSource, /Start an email/);
assert.match(pageSource, /Open in Maps/);
assert.match(pageSource, /opens in a new tab/);
assert.doesNotMatch(pageSource, /<Link key=\{item\.href\} href=\{item\.href\}>\s*<div/);

console.log("Contact flow UX guard passed.");
