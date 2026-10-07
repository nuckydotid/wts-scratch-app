import { Platform } from "react-native";
import { config } from "./config";

/**
 * OneSignal push. Users are identified by their Firebase uid (`external_id`), which is what the API targets.
 * No-ops on web and until the project has a OneSignal app id in `project.config.json`.
 */
type OneSignalModule = typeof import("react-native-onesignal");
let mod: OneSignalModule | null = null;
let initialised = false;

const enabled = () => Platform.OS !== "web" && !!config.onesignal.appId;

async function load(): Promise<OneSignalModule | null> {
  if (!enabled()) return null;
  mod ??= await import("react-native-onesignal");
  if (!initialised) {
    mod.OneSignal.initialize(config.onesignal.appId);
    initialised = true;
  }
  return mod;
}

export async function loginPush(uid: string): Promise<void> {
  const m = await load();
  if (!m) return;
  m.OneSignal.login(uid);
  void m.OneSignal.Notifications.requestPermission(true);
}

export async function logoutPush(): Promise<void> {
  (await load())?.OneSignal.logout();
}
