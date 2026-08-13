import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import { consumptionService } from "@/lib/db";
import { toEntryDate } from "@/lib/dates";
import type { ConsumptionLog, ConsumptionStatusValue } from "@/lib/database.types";

interface ConsumptionContextType {
  /** Keyed by local YYYY-MM-DD. */
  consumptionHistory: Map<string, ConsumptionLog>;
  isLoading: boolean;
  /** Set when a load or save fails, so screens can show a real error. */
  error: string | null;
  loadConsumptionHistory: (startDate: string, endDate: string) => Promise<void>;
  saveConsumption: (
    status: ConsumptionStatusValue,
    comment: string,
    date: Date,
  ) => Promise<void>;
  getByDate: (date: Date) => ConsumptionLog | undefined;
}

const ConsumptionContext = createContext<ConsumptionContextType | undefined>(
  undefined,
);

export function ConsumptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [consumptionHistory, setConsumptionHistory] = useState<
    Map<string, ConsumptionLog>
  >(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConsumptionHistory = useCallback(
    async (startDate: string, endDate: string) => {
      if (!user) return;

      setIsLoading(true);
      setError(null);
      try {
        const logs = await consumptionService.getRange(
          user.id,
          startDate,
          endDate,
        );
        setConsumptionHistory((previous) => {
          // Merge rather than replace so loading one week doesn't discard
          // another week already in memory.
          const next = new Map(previous);
          logs.forEach((log) => next.set(log.entry_date, log));
          return next;
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Couldn't load your history.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [user],
  );

  const saveConsumption = useCallback(
    async (
      status: ConsumptionStatusValue,
      comment: string,
      date: Date,
    ) => {
      if (!user) throw new Error("Not signed in");

      const key = toEntryDate(date);
      const previous = consumptionHistory.get(key);

      // Optimistic write so the calendar responds immediately.
      setConsumptionHistory((current) => {
        const next = new Map(current);
        next.set(key, {
          id: previous?.id ?? `pending-${key}`,
          user_id: user.id,
          entry_date: key,
          status,
          comment,
          created_at: previous?.created_at ?? new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        return next;
      });

      try {
        const saved = await consumptionService.save(
          user.id,
          status,
          comment,
          date,
        );
        setConsumptionHistory((current) => {
          const next = new Map(current);
          next.set(key, saved);
          return next;
        });
        setError(null);
      } catch (err) {
        // Roll back to whatever was there before, not to nothing — deleting the
        // entry made a failed edit look like a deleted day.
        setConsumptionHistory((current) => {
          const next = new Map(current);
          if (previous) {
            next.set(key, previous);
          } else {
            next.delete(key);
          }
          return next;
        });
        setError(err instanceof Error ? err.message : "Couldn't save that.");
        throw err;
      }
    },
    [user, consumptionHistory],
  );

  const getByDate = useCallback(
    (date: Date) => consumptionHistory.get(toEntryDate(date)),
    [consumptionHistory],
  );

  const value = useMemo(
    () => ({
      consumptionHistory,
      isLoading,
      error,
      loadConsumptionHistory,
      saveConsumption,
      getByDate,
    }),
    [
      consumptionHistory,
      isLoading,
      error,
      loadConsumptionHistory,
      saveConsumption,
      getByDate,
    ],
  );

  return (
    <ConsumptionContext.Provider value={value}>
      {children}
    </ConsumptionContext.Provider>
  );
}

export function useConsumption() {
  const context = useContext(ConsumptionContext);
  if (context === undefined) {
    throw new Error("useConsumption must be used within a ConsumptionProvider");
  }
  return context;
}
