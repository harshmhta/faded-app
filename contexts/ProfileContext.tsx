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
import type { Profile } from "@/lib/database.types";

/**
 * The single source of truth for quit date and spending baseline.
 *
 * Previously the home screen held a hard-coded `sobrietyStartDate` of "5 days
 * ago" and an unpersisted `dailySpending` of 15, which meant the savings card
 * and the sobriety timer displayed numbers derived from different data. Both
 * now read from here.
 */
export interface ProfileContextType {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;

  /** Null until the user sets a quit date during onboarding. */
  quitDate: Date | null;
  /** Whole days since the quit date, or null if it isn't set. */
  daysClean: number | null;
  dailySpend: number;
  currency: string;
  /** Money not spent since the quit date. Null when the quit date is unset. */
  estimatedSaved: number | null;
  /** False until onboarding is finished — drives the first-run flow. */
  isOnboarded: boolean;

  refresh: () => Promise<void>;
  completeOnboarding: (input: {
    quitDate: Date;
    dailySpend: number;
    currency?: string;
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
    async (input: { quitDate: Date; dailySpend: number; currency?: string }) => {
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
      isOnboarded: !!profile?.onboarded_at && !!profile?.quit_date,
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
