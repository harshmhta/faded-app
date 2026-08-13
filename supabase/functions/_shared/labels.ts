/**
 * Human-readable labels for onboarding answer IDs.
 *
 * Duplicated from constants/onboardingQuestions.ts rather than imported: Edge
 * Functions are deployed separately from the app bundle and cannot reach into
 * it. Only the IDs that are worth putting in front of the model live here —
 * unknown IDs are dropped rather than shown raw, so an added question never
 * leaks `"cant-sleep"` into a prompt.
 *
 * If you add options in the app, add them here too, or Luma simply won't hear
 * about them.
 */

export const TRIGGER_LABELS: Record<string, string> = {
  stress: "stress or pressure",
  anxiety: "anxiety",
  boredom: "boredom",
  "low-mood": "low mood",
  loneliness: "loneliness",
  "end-of-day": "the end of the day",
  friends: "being around people who use",
  "alone-home": "being home alone",
  "cant-sleep": "not being able to sleep",
  celebrating: "celebrating something",
  conflict: "after an argument",
};

export const REASON_LABELS: Record<string, string> = {
  clarity: "thinking more clearly",
  money: "not spending the money",
  sleep: "sleeping without it",
  energy: "having more energy",
  relationships: "being present with people",
  control: "feeling in control again",
  health: "physical health",
  prove: "proving to themselves they can",
};

export const FREQUENCY_LABELS: Record<string, string> = {
  "multiple-daily": "a few times a day",
  daily: "about once a day",
  "most-days": "most days of the week",
  weekly: "once or twice a week",
  occasional: "a few times a month",
};

export function resolveLabels(
  ids: unknown,
  map: Record<string, string>,
): string[] {
  if (!Array.isArray(ids)) return [];
  return ids
    .map((id) => (typeof id === "string" ? map[id] : undefined))
    .filter((label): label is string => !!label);
}
