import "dotenv/config";

export default {
  expo: {
    name: "Faded",
    slug: "fadedapp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    // Our own scheme, so it no longer depends on a vendor's callback naming
    // and can't resolve to "...-undefined" when an env var is missing.
    // Must match the redirect URL allow-list in Supabase Auth settings.
    scheme: "faded",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.fadedapp",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      icon: "faded.icon"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "com.fadedapp",
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-secure-store",
      "expo-dev-client",
      "expo-font",
      "expo-web-browser",
      "react-native-bottom-tabs",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      "expo-apple-authentication",
      [
        "expo-camera",
        {
          cameraPermission: "Allow Faded to access your camera for accountability mirror feature.",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: process.env.EAS_PROJECT_ID,
      },
    },
  },
};
