// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // Edge Functions are Deno, not React Native — different globals and
    // module resolution, so they are linted by `deno lint` instead.
    ignores: ["dist/*", "supabase/functions/*"],
  },
]);
