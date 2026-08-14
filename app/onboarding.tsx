import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { AnalyzingStep } from "@/components/onboarding/AnalyzingStep";
import { ChoiceCard } from "@/components/onboarding/ChoiceCard";
import {
  ACCENT,
  GlassPanel,
  OnboardingShell,
} from "@/components/onboarding/OnboardingShell";
import { ResultsStep } from "@/components/onboarding/ResultsStep";
import { ThemedText } from "@/components/ThemedText";
import { FontFamily } from "@/constants/Fonts";
import {
  DURATION_OPTIONS,
  EFFECT_GROUPS,
  FREQUENCY_OPTIONS,
  GOAL_OPTIONS,
  REASON_OPTIONS,
  SPEND_PERIODS,
  TIME_OF_DAY_OPTIONS,
  TRIGGER_GROUPS,
  toDailySpend,
  type ChoiceGroup,
  type ChoiceOption,
  type SpendPeriod,
} from "@/constants/onboardingQuestions";
import { useProfile } from "@/contexts/ProfileContext";
import { useColorScheme } from "@/hooks/useColorScheme";

const STEPS = [
  "welcome",
  "frequency",
  "duration",
  "timesOfDay",
  "spend",
  "triggers",
  "effects",
  "reasons",
  "analyzing",
  "results",
  "quitDate",
  "goal",
  "pledge",
] as const;

type StepId = (typeof STEPS)[number];

export default function OnboardingScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";
  const { completeOnboarding, currency } = useProfile();

  const [stepIndex, setStepIndex] = React.useState(0);
  const [saving, setSaving] = React.useState(false);

  const [frequency, setFrequency] = React.useState<string | null>(null);
  const [duration, setDuration] = React.useState<string | null>(null);
  const [timesOfDay, setTimesOfDay] = React.useState<string[]>([]);
  const [triggers, setTriggers] = React.useState<string[]>([]);
  const [effects, setEffects] = React.useState<string[]>([]);
  const [reasons, setReasons] = React.useState<string[]>([]);
  const [spendAmount, setSpendAmount] = React.useState("");
  const [spendPeriod, setSpendPeriod] = React.useState<SpendPeriod>("week");
  const [alreadyStopped, setAlreadyStopped] = React.useState<boolean | null>(
    null,
  );
  const [backdate, setBackdate] = React.useState<Date>(
    () => new Date(Date.now() - 86_400_000),
  );
  const [goalDays, setGoalDays] = React.useState<string | null>("30");

  const step = STEPS[stepIndex];
  const progress = (stepIndex + 1) / STEPS.length;

  const goNext = React.useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }, []);

  const goBack = React.useCallback(() => {
    setStepIndex((i) => {
      let prev = i - 1;
      // Never step back INTO the analyzing animation — jump over it so
      // "back" from the results goes to the last real question.
      if (STEPS[prev] === "analyzing") prev -= 1;
      return Math.max(prev, 0);
    });
  }, []);

  const toggle = (
    list: string[],
    setList: (v: string[]) => void,
    id: string,
  ) => {
    setList(
      list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
    );
  };

  const parsedSpend = Number.parseFloat(spendAmount.replace(/[^0-9.]/g, ""));
  const dailySpend = toDailySpend(parsedSpend, spendPeriod);

  const finish = async (): Promise<boolean> => {
    if (saving) return false;
    setSaving(true);
    try {
      await completeOnboarding({
        dailySpend: dailySpend > 0 ? dailySpend : 15,
        quitDate: alreadyStopped ? backdate : undefined,
        answers: {
          frequency: frequency ?? undefined,
          duration: duration ?? undefined,
          timesOfDay,
          triggers,
          effects,
          reasons,
          spendAmount: Number.isFinite(parsedSpend) ? parsedSpend : undefined,
          spendPeriod,
          backdatedQuitDate: alreadyStopped
            ? backdate.toISOString()
            : undefined,
          goalDays: goalDays ? Number(goalDays) : undefined,
        },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
      return true;
    } catch (error) {
      Alert.alert(
        "Couldn't save that",
        error instanceof Error
          ? error.message
          : "Check your connection and try again.",
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------------
  // Step bodies
  // ---------------------------------------------------------------------

  const renderGroups = (
    groups: ChoiceGroup[],
    selected: string[],
    setSelected: (v: string[]) => void,
  ) => (
    <View>
      {groups.map((group, gi) => (
        <View key={group.title ?? gi} style={styles.group}>
          {group.title ? (
            <ThemedText style={styles.groupTitle}>{group.title}</ThemedText>
          ) : null}
          {group.options.map((opt, oi) => (
            <Animated.View
              key={opt.id}
              entering={FadeInDown.delay(gi * 60 + oi * 30).duration(300)}
            >
              <ChoiceCard
                label={opt.label}
                sublabel={opt.sublabel}
                selected={selected.includes(opt.id)}
                onPress={() => toggle(selected, setSelected, opt.id)}
              />
            </Animated.View>
          ))}
        </View>
      ))}
    </View>
  );

  const renderList = (
    options: ChoiceOption[],
    selected: string[] | string | null,
    onSelect: (id: string) => void,
    variant: "radio" | "checkbox",
  ) => (
    <View>
      {options.map((opt, i) => (
        <Animated.View
          key={opt.id}
          entering={FadeInDown.delay(i * 40).duration(300)}
        >
          <ChoiceCard
            label={opt.label}
            sublabel={opt.sublabel}
            variant={variant}
            selected={
              Array.isArray(selected)
                ? selected.includes(opt.id)
                : selected === opt.id
            }
            onPress={() => onSelect(opt.id)}
          />
        </Animated.View>
      ))}
    </View>
  );

  const body = () => {
    switch (step) {
      case "welcome":
        return <WelcomeStep />;

      case "frequency":
        return renderList(
          FREQUENCY_OPTIONS,
          frequency,
          (id) => setFrequency(id),
          "radio",
        );

      case "duration":
        return renderList(
          DURATION_OPTIONS,
          duration,
          (id) => setDuration(id),
          "radio",
        );

      case "timesOfDay":
        return renderList(
          TIME_OF_DAY_OPTIONS,
          timesOfDay,
          (id) => toggle(timesOfDay, setTimesOfDay, id),
          "checkbox",
        );

      case "spend":
        return (
          <SpendStep
            amount={spendAmount}
            onAmountChange={setSpendAmount}
            period={spendPeriod}
            onPeriodChange={setSpendPeriod}
            dailySpend={dailySpend}
            isDark={isDark}
          />
        );

      case "triggers":
        return renderGroups(TRIGGER_GROUPS, triggers, setTriggers);

      case "effects":
        return renderGroups(EFFECT_GROUPS, effects, setEffects);

      case "reasons":
        return renderList(
          REASON_OPTIONS,
          reasons,
          (id) => toggle(reasons, setReasons, id),
          "checkbox",
        );

      case "analyzing":
        return <AnalyzingStep onDone={goNext} />;

      case "results":
        return (
          <ResultsStep
            dailySpend={dailySpend}
            currency={currency}
            triggerCount={triggers.length}
            reasonCount={reasons.length}
            topReason={
              REASON_OPTIONS.find((r) => r.id === reasons[0])?.label
            }
          />
        );

      case "quitDate":
        return (
          <QuitDateStep
            alreadyStopped={alreadyStopped}
            setAlreadyStopped={setAlreadyStopped}
            backdate={backdate}
            setBackdate={setBackdate}
            isDark={isDark}
          />
        );

      case "goal":
        return (
          <View>
            {renderList(
              GOAL_OPTIONS,
              goalDays,
              (id) => setGoalDays(id),
              "radio",
            )}
            <ThemedText style={styles.goalNote}>
              You can change this whenever you want. Hitting it isn&apos;t the
              point — having somewhere to aim is.
            </ThemedText>
          </View>
        );

      case "pledge":
        return <PledgeStep onComplete={finish} saving={saving} />;
    }
  };

  // ---------------------------------------------------------------------
  // Shell config per step
  // ---------------------------------------------------------------------

  const config: Record<
    StepId,
    {
      title?: string;
      subtitle?: string;
      cta?: string;
      disabled?: boolean;
      footnote?: string;
      onCta?: () => void;
      scrollable?: boolean;
    }
  > = {
    welcome: {
      cta: "Get started",
      onCta: goNext,
      footnote: "Takes about two minutes",
      scrollable: false,
    },
    frequency: {
      title: "How often are you using right now?",
      subtitle: "Be honest — nobody sees this but you.",
      cta: "Continue",
      disabled: !frequency,
      onCta: goNext,
    },
    duration: {
      title: "How long has that been the pattern?",
      cta: "Continue",
      disabled: !duration,
      onCta: goNext,
    },
    timesOfDay: {
      title: "When does it usually happen?",
      subtitle: "Pick whatever fits.",
      cta: timesOfDay.length ? "Continue" : "Skip",
      onCta: goNext,
      footnote: "Choose as many as you like",
    },
    spend: {
      title: "Roughly what does it cost you?",
      subtitle:
        "A rough number is fine. You can change it later, and it only ever shows up as what you're saving.",
      cta: dailySpend > 0 ? "Continue" : "Skip for now",
      onCta: goNext,
    },
    triggers: {
      title: "What usually comes right before?",
      subtitle: "Knowing the pattern is most of the work.",
      cta: triggers.length ? "Continue" : "Skip",
      onCta: goNext,
      footnote: "Choose as many as you like",
    },
    effects: {
      title: "What has it started to touch?",
      subtitle: "Only what feels true for you.",
      cta: effects.length ? "Continue" : "Skip",
      onCta: goNext,
      footnote: "Choose as many as you like",
    },
    reasons: {
      title: "What do you want back?",
      subtitle: "These come back to you on the hard days.",
      cta: reasons.length ? "Continue" : "Skip",
      onCta: goNext,
      footnote: "Choose as many as you like",
    },
    analyzing: { scrollable: false },
    results: {
      title: "Here's where you're starting",
      cta: "Continue",
      onCta: goNext,
    },
    quitDate: {
      title: "When did the clock start?",
      cta: "Continue",
      disabled: alreadyStopped === null,
      onCta: goNext,
    },
    goal: {
      title: "What are you aiming at first?",
      subtitle:
        "Something close enough to feel real. You get a badge either way.",
      cta: "Commit to this",
      disabled: !goalDays,
      onCta: goNext,
    },
    pledge: { scrollable: false },
  };

  const c = config[step];

  return (
    <OnboardingShell
      progress={progress}
      onBack={stepIndex > 0 && step !== "analyzing" ? goBack : undefined}
      title={c.title}
      subtitle={c.subtitle}
      ctaLabel={c.cta}
      onCta={c.onCta}
      ctaDisabled={c.disabled}
      footnote={c.footnote}
      scrollable={c.scrollable !== false}
    >
      <Animated.View
        key={step}
        entering={FadeIn.duration(240)}
        exiting={FadeOut.duration(120)}
        style={c.scrollable === false ? styles.fill : undefined}
      >
        {body()}
      </Animated.View>
    </OnboardingShell>
  );
}

// -------------------------------------------------------------------------
// Welcome
// -------------------------------------------------------------------------

function WelcomeStep() {
  return (
    <View style={styles.welcome}>
      <Animated.View entering={FadeInDown.duration(500)}>
        <ThemedText style={styles.welcomeTitle}>
          You already did the hard part.
        </ThemedText>
        <ThemedText style={styles.welcomeBody}>
          Deciding is the part most people never get to. Your clock is already
          running — it started the moment you made an account.
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(220).duration(500)}>
        <GlassPanel style={styles.welcomeCard}>
          <ThemedText style={styles.welcomeCardTitle}>
            A few questions first
          </ThemedText>
          <ThemedText style={styles.welcomeCardBody}>
            They shape your dashboard, and they mean Luma already knows your
            situation the first time you open a conversation.
          </ThemedText>
        </GlassPanel>
      </Animated.View>
    </View>
  );
}

// -------------------------------------------------------------------------
// Spend
// -------------------------------------------------------------------------

function SpendStep({
  amount,
  onAmountChange,
  period,
  onPeriodChange,
  dailySpend,
  isDark,
}: {
  amount: string;
  onAmountChange: (v: string) => void;
  period: SpendPeriod;
  onPeriodChange: (v: SpendPeriod) => void;
  dailySpend: number;
  isDark: boolean;
}) {
  return (
    <View style={styles.group}>
      <GlassPanel style={styles.spendPanel}>
        <View style={styles.spendRow}>
          <ThemedText style={styles.spendSymbol}>$</ThemedText>
          <TextInput
            value={amount}
            onChangeText={onAmountChange}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={isDark ? "#666" : "#BBB"}
            style={[styles.spendInput, { color: isDark ? "#FFF" : "#000" }]}
            maxLength={7}
            accessibilityLabel="Amount you spend"
          />
        </View>

        <View style={styles.periodRow}>
          {SPEND_PERIODS.map((p) => {
            const active = p.id === period;
            return (
              <Pressable
                key={p.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onPeriodChange(p.id);
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={[
                  styles.periodChip,
                  {
                    backgroundColor: active
                      ? ACCENT
                      : isDark
                        ? "rgba(255,255,255,0.07)"
                        : "rgba(0,0,0,0.05)",
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.periodChipText,
                    active && { color: "#FFFFFF" },
                  ]}
                >
                  {p.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </GlassPanel>

      {dailySpend > 0 ? (
        <Animated.View entering={FadeIn.duration(240)}>
          <ThemedText style={styles.spendHint}>
            That&apos;s about ${Math.round(dailySpend * 365).toLocaleString("en-US")} a
            year.
          </ThemedText>
        </Animated.View>
      ) : null}
    </View>
  );
}

// -------------------------------------------------------------------------
// Quit date
// -------------------------------------------------------------------------

function QuitDateStep({
  alreadyStopped,
  setAlreadyStopped,
  backdate,
  setBackdate,
  isDark,
}: {
  alreadyStopped: boolean | null;
  setAlreadyStopped: (v: boolean) => void;
  backdate: Date;
  setBackdate: (d: Date) => void;
  isDark: boolean;
}) {
  return (
    <View>
      <ChoiceCard
        label="Today — I'm starting now"
        sublabel="Your clock is already running from when you signed up"
        variant="radio"
        selected={alreadyStopped === false}
        onPress={() => setAlreadyStopped(false)}
      />
      <ChoiceCard
        label="I'd already stopped before this"
        sublabel="Set the real date so your streak is accurate"
        variant="radio"
        selected={alreadyStopped === true}
        onPress={() => setAlreadyStopped(true)}
      />

      {alreadyStopped ? (
        <Animated.View entering={FadeInDown.duration(300)}>
          <GlassPanel style={styles.datePanel}>
            <DateTimePicker
              value={backdate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              maximumDate={new Date()}
              onChange={(_, d) => d && setBackdate(d)}
              textColor={isDark ? "#FFFFFF" : "#000000"}
              themeVariant={isDark ? "dark" : "light"}
            />
          </GlassPanel>
        </Animated.View>
      ) : null}
    </View>
  );
}

// -------------------------------------------------------------------------
// Pledge — hold to commit
// -------------------------------------------------------------------------

const HOLD_MS = 1400;

function PledgeStep({
  onComplete,
  saving,
}: {
  /** Resolves false when the save failed, so the button re-arms for a retry. */
  onComplete: () => Promise<boolean>;
  saving: boolean;
}) {
  const fill = useSharedValue(0);
  const [held, setHeld] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = () => {
    if (held || saving) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    fill.value = withTiming(1, {
      duration: HOLD_MS,
      easing: Easing.linear,
    });
    timer.current = setTimeout(async () => {
      setHeld(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const ok = await onComplete();
      if (!ok) {
        // Save failed (finish() already alerted). Re-arm the button —
        // otherwise a network blip on the last step leaves onboarding
        // stuck on a permanently disabled "Committed".
        setHeld(false);
        fill.value = withTiming(0, { duration: 220 });
      }
    }, HOLD_MS);
  };

  const cancel = () => {
    if (held) return;
    if (timer.current) clearTimeout(timer.current);
    fill.value = withTiming(0, { duration: 220 });
  };

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fill.value * 100}%`,
  }));

  return (
    <View style={styles.pledge}>
      <Animated.View entering={FadeInDown.duration(500)}>
        <ThemedText style={styles.pledgeTitle}>One thing to agree to</ThemedText>
        <ThemedText style={styles.pledgeBody}>
          Just today. Not forever, not the rest of your life — today. Tomorrow
          you get to decide again.
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <GlassPanel style={styles.pledgeCard}>
          <ThemedText style={styles.pledgeQuote}>
            I&apos;m not going to use today. If I slip, I&apos;ll log it and
            keep going instead of starting over.
          </ThemedText>
        </GlassPanel>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(360).duration(500)}
        style={styles.holdWrap}
      >
        <Pressable
          onPressIn={start}
          onPressOut={cancel}
          disabled={saving || held}
          accessibilityRole="button"
          accessibilityLabel="Hold to commit"
          accessibilityHint="Press and hold for a moment to finish setting up"
          style={styles.holdButton}
        >
          <View style={styles.holdTrack} />
          <Animated.View style={[styles.holdFill, fillStyle]}>
            <LinearGradient
              colors={[ACCENT, "#3E9E43"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
          <ThemedText style={styles.holdText}>
            {saving ? "Setting things up..." : held ? "Committed" : "Hold to commit"}
          </ThemedText>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  goalNote: {
    fontSize: 13.5,
    lineHeight: 19,
    opacity: 0.5,
    textAlign: "center",
    paddingHorizontal: 12,
    marginTop: 8,
  },
  group: { marginBottom: 18 },
  groupTitle: {
    fontSize: 13,
    fontFamily: FontFamily.medium,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    opacity: 0.45,
    marginBottom: 10,
    marginTop: 6,
  },

  welcome: { flex: 1, justifyContent: "center", gap: 26, paddingBottom: 40 },
  welcomeTitle: {
    fontSize: 34,
    lineHeight: 41,
    fontFamily: FontFamily.medium,
    marginBottom: 14,
  },
  welcomeBody: { fontSize: 17, lineHeight: 25, opacity: 0.65 },
  welcomeCard: { padding: 20 },
  welcomeCardTitle: {
    fontSize: 17,
    fontFamily: FontFamily.medium,
    marginBottom: 6,
  },
  welcomeCardBody: { fontSize: 15, lineHeight: 21, opacity: 0.6 },

  spendPanel: { padding: 22 },
  spendRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  spendSymbol: {
    fontSize: 34,
    fontFamily: FontFamily.medium,
    opacity: 0.45,
  },
  spendInput: {
    flex: 1,
    fontSize: 46,
    fontFamily: FontFamily.medium,
    padding: 0,
  },
  periodRow: { flexDirection: "row", gap: 8, marginTop: 18 },
  periodChip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
  },
  periodChipText: { fontSize: 14.5 },
  spendHint: {
    fontSize: 14.5,
    opacity: 0.55,
    textAlign: "center",
    marginTop: 14,
  },

  datePanel: { marginTop: 12, paddingVertical: 6, alignItems: "center" },

  pledge: { flex: 1, justifyContent: "center", gap: 24, paddingBottom: 30 },
  pledgeTitle: {
    fontSize: 30,
    lineHeight: 37,
    fontFamily: FontFamily.medium,
    marginBottom: 12,
  },
  pledgeBody: { fontSize: 16.5, lineHeight: 24, opacity: 0.65 },
  pledgeCard: { padding: 22 },
  pledgeQuote: {
    fontSize: 19,
    lineHeight: 28,
    fontFamily: FontFamily.mediumItalic,
  },
  holdWrap: { marginTop: 6 },
  holdButton: {
    height: 58,
    borderRadius: 999,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  holdTrack: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(76,175,80,0.18)",
  },
  holdFill: { position: "absolute", left: 0, top: 0, bottom: 0 },
  holdText: {
    fontSize: 17,
    fontFamily: FontFamily.medium,
  },
});
