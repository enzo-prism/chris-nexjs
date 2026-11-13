import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const shell = readFileSync("client/src/AppPageShell.tsx", "utf8");
assert(shell.indexOf("{children}") < shell.indexOf("<HolidayHoursNotice />"),
  "Post-hydration holiday banner must follow page content to avoid shifting the hero");
const funnel = readFileSync("client/src/components/sections/ScheduleRequestFunnel.tsx", "utf8");
assert(funnel.indexOf("<AppointmentForm") < funnel.indexOf("{holiday.shortNotice}"),
  "Temporary hours must not push the initial booking choices below the phone viewport");
console.log("Holiday layout placement guards passed.");
