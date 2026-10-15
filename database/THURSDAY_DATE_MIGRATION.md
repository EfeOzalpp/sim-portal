# Thursday Calendar Date Cutover

Thursday dates represent calendar days, stored at UTC midnight. Generation,
date-picker round trips, and labels now use that convention. This fixes weekday
and daylight-saving discrepancies; it does not calculate academic holidays or
institutional breaks. Those still require an explicit academic calendar.

## Existing Data

For the current development drill, the agreed rule is Wednesday -> next Thursday,
Friday -> previous Thursday, and Thursday -> the same day at UTC midnight.
Wednesday/Friday corrections do not need individual date review for this drill.
Other weekdays and conflicting target dates remain unresolved. These scripts
are manual maintenance tools and are not invoked by builds or app startup.

Do not run the seed or use `editSemester` as a date migration. The seed deletes
data. Semester editing can rename/reuse existing Thursdays, delete placeholders,
or disconnect rows. Keeping records alone does not guarantee the right content
ends up on the right date.

There is no universally correct one-day shift. Previous generation depended on
the server timezone and input timestamps. Some rows may already have correct
UTC dates; others may have local-midnight timestamps or incorrect weekdays.
The schema does not record the original semester range or generation timezone,
so neither can be reliably reconstructed from the current rows alone.

## Review Before Writing

1. Take a full database backup and verify restoration into an isolated copy.
2. Export Thursdays with ID, semester ID, exact timestamp, name, and attached
   production/presentation IDs and people relationships. Include orphan rows.
3. Compare UTC dates and the historical institution-local dates against the
   actual approved semester calendars. Flag non-Thursdays, duplicate dates,
   missing weeks, unexpected times, and exceptions; do not auto-correct them.
4. Produce an explicit reviewed plan of `{ id, semesterId, oldDate, newDate }`.
   Use content/date evidence to map each ID. Never zip sorted rows against a
   newly generated list: missing weeks and custom events make that ambiguous.
5. Keep already correct dates unchanged. Resolve conflicting target dates and
   ambiguous records manually. Do not merge, delete, rename, or reassign records.

## Apply The Approved Plan

- Rehearse on the restored copy, including rendered dates and edit/save round
  trips in different timezones. Record all approvals and unresolved exceptions.
- Pause writes during cutover. Back up again immediately before applying.
- Use a dedicated migration transaction that updates only `Thursday.date` by
  ID. Require both the old timestamp and semester ID still to match; abort the
  whole transaction if any planned row has changed or is missing.
- Do not create/delete rows or alter names, semester membership, productions,
  presentations, grades, or people relationships. Log every before/after value.
- Verify row counts and relationship IDs against the snapshot, all approved
  mappings, and idempotency. Reapplying the plan must skip approved new values
  and reject unexpected values.
- Deploy the UTC generator, input serializers, and date formatting together with
  the approved data migration. Deploying the formatter alone can change the
  displayed date of old local-time records before they have been reviewed.
- Restore service only after checks pass. Roll back dates from the logged old
  values if needed, with the same transaction/state checks; keep the full backup
  available for a coordinated code/data rollback.

No database changes are performed by this document or the generator fix.
