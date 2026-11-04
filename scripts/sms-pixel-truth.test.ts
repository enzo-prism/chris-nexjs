import assert from "node:assert/strict";

import {
  CONSENT_OCR_PHRASES,
  contrastRatio,
  isCriticalOcrPhrase,
  levenshtein,
  normalizeOcr,
  normalizedPhraseDistance,
  phrasesRecognized,
  TWILIO_OCR_PHRASES,
} from "./sms-pixel-truth";

assert.equal(normalizeOcr("Msg & data rates may apply."), "msg and data rates may apply");
assert.equal(levenshtein("stop", "stop"), 0);
assert.ok(normalizedPhraseDistance("Reply STOP to opt out of further texts.", "reply stop to opt out") <= 0.1);
assert.equal(isCriticalOcrPhrase("will not be shared with any third parties"), true);
assert.equal(isCriticalOcrPhrase("consent to receive text messages is not required to receive care"), true);
assert.equal(isCriticalOcrPhrase("No mobile information will be shared"), true);
assert.equal(isCriticalOcrPhrase("message frequency varies"), false);
assert.deepEqual(
  phrasesRecognized(
    "Message frequency varies. Message and data rates may apply. Reply STOP to opt out. Reply HELP for help. Consent to receive text messages is not required to receive care.",
    CONSENT_OCR_PHRASES,
  ).missed,
  [],
);
assert.ok(
  phrasesRecognized(
    "Message frequency varies. Message and data rates may apply.",
    ["message frequency varies"],
  ).missed.length === 0,
);
assert.ok(
  phrasesRecognized("this information will be shared with any third parties", TWILIO_OCR_PHRASES).missed.includes(
    "will not be shared with any third parties",
  ),
  "dropping 'not' from the exclusion phrase must fail even when Levenshtein distance is <= 0.1",
);
assert.ok(
  phrasesRecognized(
    "All other use case categories exclude text messaging originator opt-in data and consent; this information will be shared with any third parties. Consent is not required to receive care.",
    TWILIO_OCR_PHRASES,
  ).missed.includes("will not be shared with any third parties"),
  "a second 'not' elsewhere must not satisfy exactPhrase for the exclusion",
);
assert.ok(
  phrasesRecognized(
    "this information will not be shared with any third partles",
    TWILIO_OCR_PHRASES,
  ).missed.includes("will not be shared with any third parties"),
  "known limit: a one-character OCR error on a negated phrase is a miss",
);
assert.ok(
  phrasesRecognized(
    "No mobile information will be shared with third parties/affiliates for marketing/promotional purposes. Information sharing to subcontractors in support services, such as customer service is permitted. All other use case categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.",
    TWILIO_OCR_PHRASES,
  ).missed.length === 0,
  "the marketing-qualifier phrase is required on a full Twilio run",
);
assert.ok(
  phrasesRecognized(
    "Consent to receive text messages is required to receive care.",
    CONSENT_OCR_PHRASES,
  ).missed.includes("consent to receive text messages is not required to receive care"),
  "dropping 'not' from the care-consent phrase must fail even when Levenshtein distance is <= 0.1",
);
assert.ok(contrastRatio([20, 40, 30], [255, 255, 255]) >= 3);
assert.ok(contrastRatio([250, 250, 250], [255, 255, 255]) < 3);
console.log("sms-pixel-truth: helper checks passed");
