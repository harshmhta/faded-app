# Backend setup

Everything the app needs on the server side: Postgres schema, auth providers,
and the Luma Edge Function. Follow top to bottom — later steps depend on
earlier ones.

The app now fails loudly at startup if `EXPO_PUBLIC_SUPABASE_URL` or
`EXPO_PUBLIC_SUPABASE_ANON_KEY` is missing, rather than silently running
against an empty backend. If you see that error, you skipped step 5.

---

## 1. Create the project

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Pick a region close to your users and save the database password somewhere
   safe — you will not be shown it again.
3. From **Project Settings → API**, copy:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon / public** key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

The anon key ships inside the app. That is fine and by design: it authorises
nothing on its own, because every table is behind row-level security. The
**service_role** key is the dangerous one — it bypasses RLS entirely. It is not
used anywhere in this codebase and must never be put in an `EXPO_PUBLIC_`
variable or committed.

---

## 2. Install the CLI and link

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>
```

The project ref is the subdomain in your project URL
(`https://<ref>.supabase.co`).

---

## 3. Run the migration

```bash
supabase db push
```

This applies both migrations in `supabase/migrations/`. The second one adds
`profiles.onboarding_answers` (jsonb), which stores what the user tells the
onboarding flow. It is read whole rather than queried, so it is deliberately
not normalised into columns — the question set changes as the flow is tuned.

The first migration creates:

| Table | Purpose |
| --- | --- |
| `profiles` | Quit date, daily spend, currency, onboarding state. One row per user. `quit_date` is set to `now()` by the signup trigger — creating an account is the commitment, so the clock starts there. |
| `sobriety_resets` | History of quit-date changes, so a relapse timeline is possible later. |
| `mood_check_ins` | One row per user per day. Unique on `(user_id, entry_date)`. |
| `consumption_logs` | One row per user per day. `status` is `clean` or `smoked`. |
| `course_progress` | XP, streak, completed chapters/sections. One row per user. |
| `chat_sessions` / `chat_messages` | Luma conversations. |

It also creates:

- **RLS on every table**, keyed on `auth.uid()`. A user can only ever read or
  write their own rows, enforced by Postgres rather than asserted by the client.
- **`handle_new_user`** — a trigger on `auth.users` that provisions a `profiles`
  row and a `course_progress` row on signup, so the app never has to
  special-case a missing profile. This is also where `quit_date` is stamped, so
  the sobriety clock starts at the account's actual creation instant rather than
  whenever the timer card first renders.
- **`delete_own_account()`** — an RPC the signed-in user can call to delete
  their account. Everything cascades from `auth.users`, so one delete removes
  all their data. (Wired to a UI control is still to do — see the readiness
  audit, REV-2.)

### Verify it worked

In the SQL editor:

```sql
-- Should list 7 tables, all with rowsecurity = true.
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

If any row shows `rowsecurity = false`, stop and investigate — that table is
readable by every authenticated user.

---

## 4. Configure auth providers

**Authentication → Providers**

### Email

On by default. Decide about **Confirm email**:

- **On** (recommended for production) — users must click a link before they can
  sign in. The app already handles this: sign-up returns "Check your inbox to
  confirm your email, then sign in."
- **Off** — faster for testing; sign-up returns a session immediately.

### Apple

1. Enable the Apple provider.
2. Add `com.fadedapp` to **Authorized Client IDs**. For native Sign in with
   Apple this is the only required field — the Services ID, team ID, and key
   are needed only for the web OAuth flow.

The app calls `signInWithIdToken` with the identity token from
`expo-apple-authentication`, and Supabase verifies it against Apple's public
keys. Nothing about the account is derived from a client-controlled value.

### Google

1. In Google Cloud Console, create an **OAuth 2.0 Web application** client.
2. Add `https://<your-ref>.supabase.co/auth/v1/callback` as an authorized
   redirect URI.
3. Paste the client ID and secret into the Supabase Google provider.

### Redirect URLs

**Authentication → URL Configuration → Redirect URLs**, add:

```
faded://auth
faded://*
exp://localhost:8081/--/auth
```

The `exp://` entry is only needed for Expo Go / dev-client testing. The app's
scheme is now `faded` (it used to be derived from the Appwrite project ID and
resolved to `appwrite-callback-undefined` whenever the env var was missing).

---

## 5. Set the app environment variables

Local development — create `.env` from `.env.example`:

```bash
cp .env.example .env
```

For builds, set them as EAS environment variables so they are not read from a
local file:

```bash
eas env:create --name EXPO_PUBLIC_SUPABASE_URL      --value "https://<ref>.supabase.co" --environment production
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "<anon-key>"                --environment production
```

Repeat with `--environment preview` and `--environment development` as needed.

---

## 6. Deploy the Luma Edge Function

Luma runs on Gemini. The API key lives on the server and is never shipped to
the app.

### Get a Gemini key

Create one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

### Set it as a function secret

```bash
supabase secrets set GEMINI_API_KEY=your-aistudio-key
```

Optionally pin a different model (defaults to `gemini-3.6-flash`):

```bash
supabase secrets set GEMINI_MODEL=gemini-3.5-flash-lite
```

### Deploy

```bash
supabase functions deploy luma-chat
```

`SUPABASE_URL` and `SUPABASE_ANON_KEY` are injected automatically — you do not
set those yourself.

### What the function does

1. Requires a valid Supabase JWT and resolves it to a real user.
2. Rate limits to **60 user messages per rolling hour** per account.
3. Loads that user's context — days since quit date, today's log, latest mood,
   current chapter — and builds the system instruction from it.
4. Sends the **last 20 turns** of the conversation along with the new message.
   (The old client sent only the newest message, which is why Luma had no
   memory of anything said earlier in a conversation.)
5. Persists both turns to `chat_messages`.

All database access inside the function runs under the caller's JWT, so RLS
applies there exactly as it does in the app. There is no service-role key in
the function.

### Test it

```bash
curl -i -X POST \
  "https://<ref>.supabase.co/functions/v1/luma-chat" \
  -H "Authorization: Bearer <a-real-user-access-token>" \
  -H "Content-Type: application/json" \
  -d '{"message":"I have been thinking about smoking tonight"}'
```

Expect `{"sessionId":"...","reply":"...","crisis":false,"title":"..."}`.
A 401 means the token is wrong or expired; a 500 mentioning configuration means
`GEMINI_API_KEY` was not set.

---

## Tuning the schema

The parts most likely to need your attention as usage grows:

**Indexes.** The migration indexes `(user_id, entry_date desc)` on both daily
tables, `(session_id, created_at)` on messages, and `(user_id, updated_at desc)`
on sessions. Those cover every query the app makes today. Check
**Database → Query Performance** after real traffic before adding more.

**Chat history growth.** `chat_messages` is the only table that grows without
bound. There is no retention policy — decide whether you want one (e.g. a
scheduled job deleting sessions untouched for a year) and whether that should
be a user-facing setting.

**`daily_spend` precision.** `numeric(10,2)`, capped at 99999 by a check
constraint to match the input cap in the UI. Widen both together if you ever
support currencies with larger nominal values.

**Consumption statuses.** Constrained to `clean` / `smoked` to match the
existing UI. If you add a "reduced" or "microdosed" state, update the check
constraint, `ConsumptionStatusValue` in `lib/database.types.ts`, and
`CONSUMPTION_OPTIONS` in `app/track-consumption.tsx` together.

**Auth email templates.** Under **Authentication → Email Templates**, the
default sender and copy are Supabase-branded. Worth customising before launch.

---

## Regenerating types

`lib/database.types.ts` is hand-written to match the migration. Once the
project is live you can generate it instead:

```bash
npx supabase gen types typescript --project-id <ref> > lib/database.types.ts
```

If you do, re-add the two hand-written unions at the bottom of the file
(`ConsumptionStatusValue` and `ChatRole`) or update the imports that use them —
generated types express those as plain `string`.
