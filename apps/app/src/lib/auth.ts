import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GoogleAuthProvider,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithCredential,
  signInWithEmailLink,
  signOut as fbSignOut,
} from "firebase/auth";
import type { ActionCodeSettings } from "firebase/auth";
import { Platform } from "react-native";
import { create } from "zustand";
import { config } from "./config";
import { authDomain, firebaseAuth, firebaseConfigured } from "./firebase";

export interface AppUser {
  uid: string;
  email: string | null;
  name: string | null;
}

interface AuthState {
  user: AppUser | null;
  /** Firebase has reported the persisted session (or there is none). */
  ready: boolean;
  busy: boolean;
  error: string | null;
  /** Subscribe to Firebase auth state; returns the unsubscribe function. */
  start: () => () => void;
  signInWithGoogle: () => Promise<void>;
  sendEmailLink: (email: string) => Promise<void>;
  /** Complete an email-link sign-in from an incoming URL; false when the URL is not a sign-in link. */
  completeEmailLink: (url: string) => Promise<boolean>;
  /** Dev mode only (Firebase not configured): sign in as `uid` against a backend started with AUTH_DEV=1. */
  signInDev: (uid: string) => void;
  signOut: () => Promise<void>;
}

const EMAIL_KEY = "emailForSignIn";
const message = (e: unknown) => (e instanceof Error ? e.message : String(e));
let devUid: string | null = null;

/** Firebase ID token for the API (refreshed automatically), or `dev:<uid>` in dev mode. */
export async function getIdToken(): Promise<string | null> {
  if (!firebaseConfigured()) return devUid ? `dev:${devUid}` : null;
  return (await firebaseAuth().currentUser?.getIdToken()) ?? null;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  ready: false,
  busy: false,
  error: null,

  start: () => {
    if (!firebaseConfigured()) {
      set({ ready: true });
      return () => {};
    }
    return onAuthStateChanged(firebaseAuth(), (u) =>
      set({ user: u ? { uid: u.uid, email: u.email, name: u.displayName } : null, ready: true }),
    );
  },

  signInWithGoogle: async () => {
    set({ busy: true, error: null });
    try {
      const auth = firebaseAuth();
      if (Platform.OS === "web") {
        // `signInWithPopup` only exists in the web build of firebase/auth; the React Native typings (see tsconfig paths) omit it.
        const web = (await import("firebase/auth")) as unknown as { signInWithPopup(a: typeof auth, p: GoogleAuthProvider): Promise<unknown> };
        await web.signInWithPopup(auth, new GoogleAuthProvider());
      } else {
        const { signInAsync } = await import("worktrees-studio-google-sign-in");
        const { idToken } = await signInAsync({ webClientId: config.firebase.webClientId });
        await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
      }
    } catch (e) {
      set({ error: message(e) });
    } finally {
      set({ busy: false });
    }
  },

  sendEmailLink: async (email) => {
    set({ busy: true, error: null });
    try {
      // The link opens the app/site on `linkDomain` (a Firebase Hosting domain; Dynamic Links are discontinued).
      const settings: ActionCodeSettings = {
        url: `https://${config.firebase.linkDomain || authDomain()}/sign-in`,
        handleCodeInApp: true,
        ...(config.firebase.linkDomain ? { linkDomain: config.firebase.linkDomain } : {}),
      };
      await sendSignInLinkToEmail(firebaseAuth(), email.trim(), settings);
      await AsyncStorage.setItem(EMAIL_KEY, email.trim());
    } catch (e) {
      set({ error: message(e) });
    } finally {
      set({ busy: false });
    }
  },

  completeEmailLink: async (url) => {
    const auth = firebaseAuth();
    if (!isSignInWithEmailLink(auth, url)) return false;
    const email = await AsyncStorage.getItem(EMAIL_KEY);
    if (!email) {
      set({ error: "Open the link on the device where you asked for it, or request a new one." });
      return true;
    }
    set({ busy: true, error: null });
    try {
      await signInWithEmailLink(auth, email, url);
      await AsyncStorage.removeItem(EMAIL_KEY);
    } catch (e) {
      set({ error: message(e) });
    } finally {
      set({ busy: false });
    }
    return true;
  },

  signInDev: (uid) => {
    devUid = uid.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64) || "dev";
    set({ user: { uid: devUid, email: null, name: devUid }, ready: true, error: null });
  },

  signOut: async () => {
    devUid = null;
    if (firebaseConfigured()) await fbSignOut(firebaseAuth());
    set({ user: null });
  },
}));
