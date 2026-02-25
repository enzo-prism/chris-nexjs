import assert from "assert";
import { trackGAEvent } from "./analytics";

let called: any = null;
(globalThis as any).window = { gtag: (...args: any[]) => { called = args; } };

trackGAEvent("test_action", { a: 1 });
assert.deepStrictEqual(called, ["event", "test_action", { a: 1 }]);

// ensure no error when gtag is missing
called = null;
delete (globalThis as any).window.gtag;
trackGAEvent("no_gtag");
assert.strictEqual(called, null);

console.log("analytics tests passed");

