/**
 * Onboarding question set.
 *
 * Deliberately long. Question-heavy onboarding costs a minute up front and
 * buys two things: the answers personalise the dashboard and give Luma real
 * context, and the act of answering is itself a commitment device.
 *
 * Tone rules, matching Luma's system instruction:
 *   - Never moralise. Someone cutting down is not failing at quitting.
 *   - No clinical language, no diagnosis, no severity labels aimed at the user.
 *   - Options are descriptions, not judgements.
 */

export interface ChoiceOption {
  id: string;
  label: string;
  sublabel?: string;
}

export interface ChoiceGroup {
  title?: string;
  options: ChoiceOption[];
}

export const FREQUENCY_OPTIONS: ChoiceOption[] = [
  { id: "multiple-daily", label: "A few times a day" },
  { id: "daily", label: "About once a day" },
  { id: "most-days", label: "Most days of the week" },
  { id: "weekly", label: "Once or twice a week" },
  { id: "occasional", label: "A few times a month" },
];

export const DURATION_OPTIONS: ChoiceOption[] = [
  { id: "under-6m", label: "Less than 6 months" },
  { id: "6m-1y", label: "6 months to a year" },
  { id: "1-3y", label: "1 to 3 years" },
  { id: "3-5y", label: "3 to 5 years" },
  { id: "5-10y", label: "5 to 10 years" },
  { id: "10y-plus", label: "More than 10 years" },
];

export const TIME_OF_DAY_OPTIONS: ChoiceOption[] = [
  { id: "wake", label: "First thing", sublabel: "Before or with breakfast" },
  { id: "midday", label: "Through the day" },
  { id: "after-work", label: "After work or class" },
  { id: "evening", label: "Evenings" },
  { id: "before-bed", label: "To fall asleep" },
  { id: "social", label: "Only around other people" },
];

export const TRIGGER_GROUPS: ChoiceGroup[] = [
  {
    title: "Feelings",
    options: [
      { id: "stress", label: "Stress or pressure" },
      { id: "anxiety", label: "Anxiety" },
      { id: "boredom", label: "Boredom" },
      { id: "low-mood", label: "Low mood" },
      { id: "loneliness", label: "Loneliness" },
    ],
  },
  {
    title: "Situations",
    options: [
      { id: "end-of-day", label: "The end of the day" },
      { id: "friends", label: "Being around people who use" },
      { id: "alone-home", label: "Being home alone" },
      { id: "cant-sleep", label: "Not being able to sleep" },
      { id: "celebrating", label: "Celebrating something" },
      { id: "conflict", label: "After an argument" },
    ],
  },
];

export const EFFECT_GROUPS: ChoiceGroup[] = [
  {
    title: "Day to day",
    options: [
      { id: "motivation", label: "Motivation has dropped" },
      { id: "focus", label: "Harder to focus" },
      { id: "memory", label: "Memory feels worse" },
      { id: "sleep", label: "Sleep depends on it" },
      { id: "energy", label: "Low energy" },
    ],
  },
  {
    title: "Life",
    options: [
      { id: "money", label: "Costing more than I want" },
      { id: "work", label: "Affecting work or study" },
      { id: "relationships", label: "Affecting people close to me" },
      { id: "hobbies", label: "Lost interest in things I used to enjoy" },
      { id: "fitness", label: "Fitness or health has slipped" },
    ],
  },
  {
    title: "How I feel about it",
    options: [
      { id: "control", label: "Feels less like a choice than it used to" },
      { id: "secrecy", label: "I play down how much I use" },
      { id: "tolerance", label: "Takes more to get the same effect" },
    ],
  },
];

export const REASON_OPTIONS: ChoiceOption[] = [
  { id: "clarity", label: "Think more clearly" },
  { id: "money", label: "Stop spending on it" },
  { id: "sleep", label: "Sleep without needing it" },
  { id: "energy", label: "Have more energy" },
  { id: "relationships", label: "Be more present with people" },
  { id: "control", label: "Feel in control again" },
  { id: "health", label: "Physical health" },
  { id: "prove", label: "Prove to myself I can" },
];

/**
 * First streak target.
 *
 * Borrowed from Liven's "set your next streak goal" step, but pinned to the
 * milestone ladder SobrietyTimerCard already uses (1, 7, 30, 90, 180, 365) so
 * the goal and the badge the app awards are the same thing rather than two
 * competing number systems.
 *
 * Deliberately stops at 90. Asking someone on day zero to commit to a year is
 * how a goal becomes something to fail at.
 */
export const GOAL_OPTIONS: ChoiceOption[] = [
  {
    id: "7",
    label: "One week",
    sublabel: "The first stretch, and the one most people feel",
  },
  {
    id: "30",
    label: "One month",
    sublabel: "Long enough for sleep and mood to settle",
  },
  {
    id: "90",
    label: "Three months",
    sublabel: "A serious target — pick it if you mean it",
  },
];

export const SPEND_PERIODS = [
  { id: "day", label: "a day" },
  { id: "week", label: "a week" },
  { id: "month", label: "a month" },
] as const;

export type SpendPeriod = (typeof SPEND_PERIODS)[number]["id"];

/** Normalise whatever period they chose down to a daily figure. */
export function toDailySpend(amount: number, period: SpendPeriod): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  const daily =
    period === "day" ? amount : period === "week" ? amount / 7 : amount / 30;
  return Math.round(daily * 100) / 100;
}

/**
 * Lines shown while the "building your plan" screen runs.
 *
 * This is a real pause with a purpose — it is where the answers get turned
 * into the numbers on the next screen — but it is also theatre, and it should
 * not pretend to be analysis it is not doing. No fake percentages, no
 * "diagnosing", no severity score.
 */
export const ANALYSIS_STEPS = [
  "Reading your answers",
  "Working out what you spend",
  "Mapping your triggers",
  "Setting up your first week",
  "Getting Luma up to speed",
];
