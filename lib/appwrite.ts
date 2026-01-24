import { Account, Client, Databases, ID, Permission, Query, Role } from "react-native-appwrite";

// Appwrite configuration
export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  platform: process.env.EXPO_PUBLIC_APPWRITE_PLATFORM,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  moodCheckInsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_MOOD_COLLECTION_ID,
  consumptionTrackingCollectionId: process.env.EXPO_PUBLIC_APPWRITE_CONSUMPTION_COLLECTION_ID,
  sobrietyTimerCollectionId: process.env.EXPO_PUBLIC_APPWRITE_SOBRIETY_TIMER_COLLECTION_ID,
};

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(appwriteConfig.endpoint || "")
  .setProject(appwriteConfig.projectId || "");

// Initialize Account service
export const account = new Account(client);

// Initialize Databases service
export const databases = new Databases(client);

export { client, ID, Permission, Query, Role };

// Mood check-in types
export interface MoodCheckIn {
  $id?: string;
  userId: string; // Still useful for queries, but permissions handle access control
  date: string; // ISO date string (YYYY-MM-DD)
  mood: string; // emoji
  comment?: string;
  timestamp: string; // ISO timestamp
  $createdAt?: string;
  $updatedAt?: string;
  $permissions?: string[];
}

// Mood check-in database functions
export const moodCheckInService = {
  // Create or update a mood check-in for a specific date
  async saveMoodCheckIn(userId: string, mood: string, comment?: string, date?: string): Promise<MoodCheckIn> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString();

    // Check if a check-in already exists for the target date
    const existing = await this.getMoodCheckInByDate(userId, targetDate);

    if (existing) {
      // Update existing check-in
      const updated = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.moodCheckInsCollectionId,
        existing.$id!,
        {
          mood,
          comment: comment || "",
          timestamp,
        }
      );
      return updated as MoodCheckIn;
    } else {
      // Create new check-in with user-specific permissions
      const newCheckIn = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.moodCheckInsCollectionId,
        ID.unique(),
        {
          userId,
          date: targetDate,
          mood,
          comment: comment || "",
          timestamp,
        },
        [
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ]
      );
      return newCheckIn as MoodCheckIn;
    }
  },

  // Get mood check-in for a specific date
  async getMoodCheckInByDate(userId: string, date: string): Promise<MoodCheckIn | null> {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.moodCheckInsCollectionId,
        [
          Query.equal('userId', userId),
          Query.equal('date', date),
          Query.limit(1),
        ]
      );
      return response.documents.length > 0 ? (response.documents[0] as MoodCheckIn) : null;
    } catch (error) {
      console.error("Error fetching mood check-in:", error);
      return null;
    }
  },

  // Get all mood check-ins for a user
  async getAllMoodCheckIns(userId: string, limit: number = 100): Promise<MoodCheckIn[]> {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.moodCheckInsCollectionId,
        [
          Query.equal('userId', userId),
          Query.orderDesc('date'),
          Query.limit(limit),
        ]
      );
      return response.documents as MoodCheckIn[];
    } catch (error) {
      console.error("Error fetching mood check-ins:", error);
      return [];
    }
  },

  // Get mood check-ins for a date range
  async getMoodCheckInsByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<MoodCheckIn[]> {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.moodCheckInsCollectionId,
        [
          Query.equal('userId', userId),
          Query.greaterThanEqual('date', startDate),
          Query.lessThanEqual('date', endDate),
          Query.orderDesc('date'),
        ]
      );
      return response.documents as MoodCheckIn[];
    } catch (error) {
      console.error("Error fetching mood check-ins by date range:", error);
      return [];
    }
  },
};

// Consumption tracking types
export interface ConsumptionTracking {
  $id?: string;
  userId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  status: string; // "clean" or "smoked"
  comment?: string;
  timestamp: string; // ISO timestamp
  $createdAt?: string;
  $updatedAt?: string;
  $permissions?: string[];
}

// Consumption tracking database functions
export const consumptionTrackingService = {
  // Create or update consumption tracking for a specific date
  async saveConsumptionTracking(userId: string, status: string, comment?: string, date?: string): Promise<ConsumptionTracking> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const timestamp = new Date().toISOString();

    // Check if tracking already exists for the target date
    const existing = await this.getConsumptionTrackingByDate(userId, targetDate);

    if (existing) {
      // Update existing tracking
      const updated = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.consumptionTrackingCollectionId,
        existing.$id!,
        {
          status,
          comment: comment || "",
          timestamp,
        }
      );
      return updated as ConsumptionTracking;
    } else {
      // Create new tracking with user-specific permissions
      const newTracking = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.consumptionTrackingCollectionId,
        ID.unique(),
        {
          userId,
          date: targetDate,
          status,
          comment: comment || "",
          timestamp,
        },
        [
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ]
      );
      return newTracking as ConsumptionTracking;
    }
  },

  // Get consumption tracking for a specific date
  async getConsumptionTrackingByDate(userId: string, date: string): Promise<ConsumptionTracking | null> {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.consumptionTrackingCollectionId,
        [
          Query.equal('userId', userId),
          Query.equal('date', date),
          Query.limit(1),
        ]
      );
      return response.documents.length > 0 ? (response.documents[0] as ConsumptionTracking) : null;
    } catch (error) {
      console.error("Error fetching consumption tracking:", error);
      return null;
    }
  },

  // Get all consumption trackings for a user
  async getAllConsumptionTrackings(userId: string, limit: number = 100): Promise<ConsumptionTracking[]> {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.consumptionTrackingCollectionId,
        [
          Query.equal('userId', userId),
          Query.orderDesc('date'),
          Query.limit(limit),
        ]
      );
      return response.documents as ConsumptionTracking[];
    } catch (error) {
      console.error("Error fetching consumption trackings:", error);
      return [];
    }
  },

  // Get consumption trackings for a date range
  async getConsumptionTrackingsByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<ConsumptionTracking[]> {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.consumptionTrackingCollectionId,
        [
          Query.equal('userId', userId),
          Query.greaterThanEqual('date', startDate),
          Query.lessThanEqual('date', endDate),
          Query.orderDesc('date'),
        ]
      );
      return response.documents as ConsumptionTracking[];
    } catch (error) {
      console.error("Error fetching consumption trackings by date range:", error);
      return [];
    }
  },
};

// Sobriety timer types
export interface SobrietyTimer {
  $id?: string;
  userId: string;
  startTime: string; // ISO timestamp
  $createdAt?: string;
  $updatedAt?: string;
  $permissions?: string[];
}

// Sobriety timer database functions
export const sobrietyTimerService = {
  // Get or create sobriety timer for user
  async getSobrietyTimer(userId: string): Promise<SobrietyTimer | null> {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.sobrietyTimerCollectionId,
        [
          Query.equal('userId', userId),
          Query.limit(1),
        ]
      );
      
      if (response.documents.length > 0) {
        return response.documents[0] as SobrietyTimer;
      }
      
      // Create initial timer if it doesn't exist
      const newTimer = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.sobrietyTimerCollectionId,
        ID.unique(),
        {
          userId,
          startTime: new Date().toISOString(),
        },
        [
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId)),
          Permission.delete(Role.user(userId)),
        ]
      );
      return newTimer as SobrietyTimer;
    } catch (error) {
      console.error("Error fetching sobriety timer:", error);
      return null;
    }
  },

  // Reset sobriety timer with new start time
  async resetSobrietyTimer(userId: string, startTime: string): Promise<SobrietyTimer | null> {
    try {
      // Get existing timer
      const existing = await this.getSobrietyTimer(userId);
      
      if (!existing || !existing.$id) {
        // Create new timer if it doesn't exist
        const newTimer = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.sobrietyTimerCollectionId,
          ID.unique(),
          {
            userId,
            startTime,
          },
          [
            Permission.read(Role.user(userId)),
            Permission.update(Role.user(userId)),
            Permission.delete(Role.user(userId)),
          ]
        );
        return newTimer as SobrietyTimer;
      }
      
      // Update existing timer
      const updated = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.sobrietyTimerCollectionId,
        existing.$id,
        {
          startTime,
        }
      );
      return updated as SobrietyTimer;
    } catch (error) {
      console.error("Error resetting sobriety timer:", error);
      return null;
    }
  },
};
