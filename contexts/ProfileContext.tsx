import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import { profileService } from "@/lib/db";
import { daysBetween } from "@/lib/dates";
import type { OnboardingAnswers, Profile } from "@/lib/database.types";

/**
 * The single source of truth for quit date and spending baseline.
 *
 * Previously the home screen held a hard-coded `sobrietyStartDate` of "5 days
 * ago" and an unpersisted `dailySpending` of 15, which meant anything reading
 * those values was working from different data than the timer. Both now read
 * from here.
 *
 * The quit date always exists — it starts when the account is created, because
 * signing up is the commitment. `null` on these fields means "profile not
 * loaded yet", never "the user hasn't set one".
 */
export interface ProfileContextType {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;

  /** Null only while the profile is loading. */
  quitDate: Date | null;
  /** Whole days since the quit date. Null only while loading. */
  daysClean: number | null;
  dailySpend: number;
  currency: string;
  /** Money not spent since the quit date. Null only while loading. */
  estimatedSaved: number | null;
  /** Whether the onboarding flow has been completed. Does not gate the timer. */
  isOnboarded: boolean;

  refresh: () => Promise<void>;
  completeOnboarding: (input: {
    dailySpend: number;
    currency?: string;
    /** Only if onboarding lets the user backdate to before signup. */
    quitDate?: Date;
    answers?: OnboardingAnswers;
  }) => Promise<void>;
  setDailySpend: (amount: number) => Promise<void>;
  resetQuitDate: (newQuitDate: Date, reason?: string) => Promise<void>;
  setDisplayName: (name: string) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      setProfile(await profileService.get(user.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load your profile.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const completeOnboarding = useCallback(
    async (input: {
      dailySpend: number;
      currency?: string;
      quitDate?: Date;
      answers?: OnboardingAnswers;
    }) => {
      if (!user) throw new Error("Not signed in");
      setProfile(await profileService.completeOnboarding(user.id, input));
    },
    [user],
  );

  const setDailySpend = useCallback(
    async (amount: number) => {
      if (!user) throw new Error("Not signed in");
      const previous = profile;
      // Optimistic — the input control should not wait on a round trip.
      setProfile((current) =>
        current ? { ...current, daily_spend: amount } : current,
      );
      try {
        setProfile(
          await profileService.update(user.id, { daily_spend: amount }),
        );
      } catch (err) {
        setProfile(previous);
        throw err;
      }
    },
    [user, profile],
  );

  const resetQuitDate = useCallback(
    async (newQuitDate: Date, reason?: string) => {
      if (!user) throw new Error("Not signed in");
      setProfile(await profileService.resetQuitDate(user.id, newQuitDate, reason));
    },
    [user],
  );

  const setDisplayName = useCallback(
    async (name: string) => {
      if (!user) throw new Error("Not signed in");
      setProfile(await profileService.update(user.id, { display_name: name }));
    },
    [user],
  );

  const value = useMemo<ProfileContextType>(() => {
    const quitDate = profile?.quit_date ? new Date(profile.quit_date) : null;
    const daysClean = quitDate ? Math.max(0, daysBetween(quitDate)) : null;
    const dailySpend = profile?.daily_spend ?? 15;

    return {
      profile,
      isLoading,
      error,
      quitDate,
      daysClean,
      dailySpend,
      currency: profile?.currency ?? "USD",
      estimatedSaved: daysClean !== null ? daysClean * dailySpend : null,
      isOnboarded: !!profile?.onboarded_at,
      refresh: load,
      completeOnboarding,
      setDailySpend,
      resetQuitDate,
      setDisplayName,
    };
  }, [
    profile,
    isLoading,
    error,
    load,
    completeOnboarding,
    setDailySpend,
    resetQuitDate,
    setDisplayName,
  ]);

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
