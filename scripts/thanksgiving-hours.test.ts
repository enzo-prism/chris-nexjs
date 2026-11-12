import assert from 'node:assert/strict';
import { officeInfo, resolveHolidayHours, getOfficeTodayISO } from '../shared/officeInfo';
const expected = [
  ['2026-11-25', '08:00', '13:00'],
  ['2026-11-26', '00:00', '00:00'],
  ['2026-11-27', '00:00', '00:00'],
];
for (const [date, opens, closes] of expected) {
  const hours = officeInfo.specialOpeningHoursSpecification.filter(h => h.validFrom === date);
  assert.equal(hours.length, 1);
  assert.equal(hours[0].validThrough, date);
  assert.equal(hours[0].opens, opens);
  assert.equal(hours[0].closes, closes);
}
assert.deepEqual(resolveHolidayHours('2026-11-12')?.entries.map(e => [e.date, e.hours]), [
  ['2026-11-25', '8:00 AM - 1:00 PM'], ['2026-11-26', 'Closed'], ['2026-11-27', 'Closed'],
]);
assert.equal(resolveHolidayHours('2026-11-28'), null);
assert.equal(getOfficeTodayISO(new Date('2026-11-28T07:59:00Z')), '2026-11-27');
assert.equal(getOfficeTodayISO(new Date('2026-11-28T08:00:00Z')), '2026-11-28');
assert.equal(officeInfo.hours.wednesday, '8:00 AM - 3:00 PM');
assert.equal(officeInfo.hours.thursday, '8:00 AM - 5:00 PM');
assert.equal(officeInfo.hours.friday, '8:00 AM - 4:00 PM');
console.log('Thanksgiving hours and Pacific expiry passed');
