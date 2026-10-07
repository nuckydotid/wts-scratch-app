import type { ExpoConfig } from "expo/config";
import projectConfig from "../../project.config.json";

const cfg = projectConfig;

const config: ExpoConfig = {
  name: cfg.name,
  slug: cfg.slug,
  scheme: cfg.scheme,
  version: cfg.version,
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  ios: { supportsTablet: true, bundleIdentifier: cfg.ios.bundleIdentifier },
  android: {
    package: cfg.android.package,
    adaptiveIcon: { foregroundImage: "./assets/adaptive-icon.png", backgroundColor: cfg.brand.primary },
  },
  web: { bundler: "metro", output: "single", favicon: "./assets/icon.png" },
  plugins: [
    "expo-router",
    // Push (OneSignal) is wired only once the project has an app id, so a fresh template builds without it.
    ...(cfg.onesignal.appId ? [["onesignal-expo-plugin", { mode: "production" }] as [string, object]] : []),
    "expo-font",
    ["expo-splash-screen", { image: "./assets/splash.png", imageWidth: 200, backgroundColor: cfg.brand.splashBackground }],
  ],
  experiments: { typedRoutes: true },
  extra: {
    api: cfg.api,
    gcp: cfg.gcp,
    firebase: cfg.firebase,
    onesignal: cfg.onesignal,
    designRoom: cfg.designRoom,
    scheme: cfg.scheme,
    ota: cfg.ota,
    brand: cfg.brand,
  },
};

export default config;
