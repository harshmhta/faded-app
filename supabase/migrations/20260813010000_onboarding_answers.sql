-- Store what the user tells us during onboarding.
--
-- Kept as jsonb rather than columns because the question set will change as the
-- flow is tuned, and none of it is queried relationally — it is read whole, to
-- personalise the dashboard and to give Luma real context about what drives
-- this particular person.

alter table public.profiles
  add column if not exists onboarding_answers jsonb not null default '{}'::jsonb;

comment on column public.profiles.onboarding_answers is
  'Free-form answers from the onboarding flow: usage frequency, duration,
   times of day, triggers, effects, and reasons for quitting. Shape is owned by
   constants/onboardingQuestions.ts, not by the database.';
