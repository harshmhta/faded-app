import { Account, Client, OAuthProvider } from "appwrite";

// Appwrite configuration
export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  platform: process.env.EXPO_PUBLIC_APPWRITE_PLATFORM,
};

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(appwriteConfig.endpoint || "")
  .setProject(appwriteConfig.projectId || "");

// Initialize Account service
export const account = new Account(client);

// Export OAuth provider
export const OAuthProviders = {
  Apple: OAuthProvider.Apple,
};

export { client };
