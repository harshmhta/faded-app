import React, { createContext, useContext, useState, useCallback } from "react";
import { ConsumptionTracking, consumptionTrackingService } from "@/lib/appwrite";
import { useAuth } from "./AuthContext";

interface ConsumptionContextType {
  consumptionHistory: Map<string, ConsumptionTracking>;
  loadConsumptionHistory: (startDate: string, endDate: string) => Promise<void>;
  saveConsumption: (status: string, comment: string, date: string) => Promise<void>;
  isLoading: boolean;
}

const ConsumptionContext = createContext<ConsumptionContextType | undefined>(undefined);

export function ConsumptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [consumptionHistory, setConsumptionHistory] = useState<Map<string, ConsumptionTracking>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(false);

  const loadConsumptionHistory = useCallback(async (startDate: string, endDate: string) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const trackings = await consumptionTrackingService.getConsumptionTrackingsByDateRange(
        user.$id,
        startDate,
        endDate
      );

      const historyMap = new Map<string, ConsumptionTracking>();
      trackings.forEach((tracking) => {
        historyMap.set(tracking.date, tracking);
      });

      setConsumptionHistory(historyMap);
    } catch (error) {
      console.error("Error loading consumption history:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const saveConsumption = useCallback(async (status: string, comment: string, date: string) => {
    if (!user) return;

    try {
      // Optimistic update - update UI immediately
      const optimisticTracking: ConsumptionTracking = {
        userId: user.$id,
        date,
        status,
        comment,
        timestamp: new Date().toISOString(),
      };
      
      setConsumptionHistory(prev => {
        const newMap = new Map(prev);
        newMap.set(date, optimisticTracking);
        return newMap;
      });

      // Save to database in background
      await consumptionTrackingService.saveConsumptionTracking(
        user.$id,
        status,
        comment,
        date
      );
    } catch (error) {
      console.error("Error saving consumption:", error);
      // Revert optimistic update on error
      setConsumptionHistory(prev => {
        const newMap = new Map(prev);
        newMap.delete(date);
        return newMap;
      });
      throw error;
    }
  }, [user]);

  return (
    <ConsumptionContext.Provider
      value={{
        consumptionHistory,
        loadConsumptionHistory,
        saveConsumption,
        isLoading,
      }}
    >
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
