import assert from "node:assert/strict";

import {
  contrastRatio,
  levenshtein,
  normalizeOcr,
  normalizedPhraseDistance,
  phrasesRecognized,
} from "./sms-pixel-truth";

assert.equal(normalizeOcr("Msg & data rates may apply."), "msg and data rates may apply");
assert.equal(levenshtein("stop", "stop"), 0);
assert.ok(normalizedPhraseDistance("Reply STOP to opt out of further texts.", "reply stop to opt out") <= 0.1);
assert.deepEqual(
  phrasesRecognized(
    "Message frequency varies. Message and data rates may apply. Reply STOP to opt out. Reply HELP for help. Consent to receive text messages is not required to receive care.",
    [
      "message frequency varies",
      "message and data rates may apply",
      "reply stop to opt out",
      "reply help for help",
      "consent to receive text messages is not required to receive care",
    ],
  ).missed,
  [],
);
assert.ok(contrastRatio([20, 40, 30], [255, 255, 255]) >= 3);
assert.ok(contrastRatio([250, 250, 250], [255, 255, 255]) < 3);
console.log("sms-pixel-truth: helper checks passed");
