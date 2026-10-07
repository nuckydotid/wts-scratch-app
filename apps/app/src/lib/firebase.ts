import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import type { Auth } from "firebase/auth";
import { Platform } from "react-native";
import { config } from "./config";

/** False on a fresh template: the app then runs in dev mode against a backend started with `AUTH_DEV=1`. */
export const firebaseConfigured = (): boolean => !!config.firebase.apiKey && !!config.gcp.projectId;

export const authDomain = (): string => `${config.gcp.projectId}.firebaseapp.com`;

let auth: Auth | null = null;

export function firebaseAuth(): Auth {
  if (auth) return auth;
  const app = getApps().length
    ? getApp()
    : initializeApp({ apiKey: config.firebase.apiKey, appId: config.firebase.appId, projectId: config.gcp.projectId, authDomain: authDomain() });
  if (Platform.OS === "web") {
    auth = getAuth(app);
  } else {
    try {
      auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
    } catch {
      auth = getAuth(app); // already initialised (Fast Refresh)
    }
  }
  return auth;
}
