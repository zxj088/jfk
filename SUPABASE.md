# Supabase Setup

The `/jfk` app keeps scorecards publicly readable so a shared link opens without an account. Cloud writes are not public: the `scorecard-write` Edge Function validates the two-digit edit code (or universal code `59`) before using the service role.

## New project

1. Run `supabase-setup.sql` in the Supabase SQL Editor.
2. Deploy `supabase/functions/scorecard-write/index.ts` as the `scorecard-write` function.
3. Put the project URL, public anon key, shared `syncKey`, and function URL in `supabase-config.js`.
4. Confirm anon can select `vegas_rounds` and `vegas_courses`, but direct anon insert, update, and delete all return permission errors.

The service role key is supplied automatically to deployed Supabase Edge Functions. Never put it in this repository or in browser code.

## Upgrade an existing project

Deployment order matters:

1. Deploy the `scorecard-write` Edge Function.
2. Apply `supabase/migrations/20260807180000_secure_scorecard_writes.sql` in one transaction.
3. Verify the migration copied every existing valid edit code into `scorecard_credentials`, removed `editCode` from public JSON, and revoked anon writes.
4. Publish the matching v200 web client immediately after the migration.
5. Test viewing without a code, current-device scoring, takeover from another phone, finish, and delete.

Do not publish the v200 client before the function and migration are ready: v200 intentionally has no direct-table write fallback because such a fallback would reopen the security hole.

## Behavior

- Viewers only use anonymous reads and never receive edit codes.
- A scoring phone remembers a verified code locally and keeps immediate local score entry while uploads run in the background.
- A takeover verifies the code once. The old scoring phone becomes read-only when it next checks the cloud lock.
- Deletes are removed locally only after the server confirms that a cloud row was deleted.
- Offline pending scores remain local and retry when connectivity returns.

## Privacy and limits

The scorecard data itself remains public to support share links. Two-digit codes are deliberately simple and the universal code `59` remains supported, so this is an integrity boundary rather than high-security authentication. Do not store sensitive personal data in scorecards.
