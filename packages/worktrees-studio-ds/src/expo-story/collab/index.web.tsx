import {
  CollabProvider,
  CollabSidePanel,
  CursorLayer,
  FollowBanner,
  PinsLayer,
  PresenceBar,
  VersionBanner,
  fromDesignView,
  pathToStory,
  storyToHref,
  toDesignView,
  useOptionalCollab,
} from "@repo/ds-collab";
import type { DesignView } from "@repo/ds-collab";
import { getApp, getApps, initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import type { User } from "firebase/auth";
import { usePathname, useRouter } from "expo-router";
import { useAnimatedReaction, runOnJS } from "react-native-reanimated";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { useCanvas } from "../layouts/canvas-context";

/** Inlined by Metro at build time (`deploy-design.sh` exports them from `project.config.json`). */
const env = {
  studioUrl: process.env.EXPO_PUBLIC_STUDIO_URL ?? "",
  projectId: process.env.EXPO_PUBLIC_STUDIO_PROJECT_ID ?? "",
  projectName: process.env.EXPO_PUBLIC_PROJECT_NAME ?? "Design",
  buildSha: process.env.EXPO_PUBLIC_BUILD_SHA ?? "",
  firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
  firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",
  firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  /** Local development against a Studio server started with OFFICE_DEV_AUTH=1; ignored in production builds. */
  devUid: process.env.NODE_ENV !== "production" ? (process.env.EXPO_PUBLIC_STUDIO_DEV_UID ?? "") : "",
};

export const collabAvailable = !!env.studioUrl && !!env.projectId && (!!env.devUid || (!!env.firebaseApiKey && !!env.firebaseProjectId));

/* ───────────── following: the leader's view reaches the right page ───────────── */

let applier: ((v: DesignView) => void) | null = null;
let pending: DesignView | null = null;

/** The flow canvas registers how to apply a followed view; a view that arrived before navigation finished is applied on registration. */
function registerApplier(fn: (v: DesignView) => void): () => void {
  applier = fn;
  if (pending) {
    const p = pending;
    pending = null;
    fn(p);
  }
  return () => {
    if (applier === fn) applier = null;
  };
}

/* ───────────── sign-in (static hosting is public; the room is not) ───────────── */

interface Identity {
  name: string;
  getToken: () => Promise<string>;
}

function FirebaseGate({ children }: { children: (id: Identity) => ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const auth = useRef(
    getAuth(
      getApps().length
        ? getApp()
        : initializeApp({ apiKey: env.firebaseApiKey, appId: env.firebaseAppId, projectId: env.firebaseProjectId, authDomain: `${env.firebaseProjectId}.firebaseapp.com` }),
    ),
  ).current;
  useEffect(() => onAuthStateChanged(auth, setUser), [auth]);
  if (user === undefined) return null;
  if (!user) {
    return (
      <div style={{ display: "grid", placeItems: "center", height: "100vh", gap: 12, fontFamily: "system-ui", textAlign: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>{env.projectName} design</h2>
          <p style={{ opacity: 0.7 }}>Sign in with the Google account that belongs to this project.</p>
          <button
            type="button"
            style={{ padding: "8px 16px", borderRadius: 8, border: "none", fontWeight: 700, cursor: "pointer" }}
            onClick={() => signInWithPopup(auth, new GoogleAuthProvider()).catch((e) => setError(e instanceof Error ? e.message : String(e)))}
          >
            Continue with Google
          </button>
          {error ? <p role="alert" style={{ color: "#f7768e" }}>{error}</p> : null}
        </div>
      </div>
    );
  }
  return <>{children({ name: user.displayName ?? user.email ?? "Guest", getToken: () => user.getIdToken() })}</>;
}

function Joined({ identity, children }: { identity: Identity; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  const onFollowView = useCallback(
    (v: DesignView) => {
      if (pathToStory(pathRef.current) !== v.story) {
        const href = storyToHref(v.story);
        pending = v;
        if (href) router.push(href as never);
        return;
      }
      applier?.(v);
    },
    [router],
  );

  return (
    <CollabProvider serverUrl={env.studioUrl} projectId={env.projectId} name={identity.name} getToken={identity.getToken} onFollowView={onFollowView}>
      {children}
    </CollabProvider>
  );
}

/** Wraps the story shell. Without configuration the stories simply run locally, as before. */
export function StoryCollabProvider({ children }: { children: ReactNode }) {
  if (!collabAvailable) return <>{children}</>;
  if (env.devUid) {
    const identity: Identity = { name: env.devUid, getToken: async () => `dev:${env.devUid}:${env.devUid}` };
    return <Joined identity={identity}>{children}</Joined>;
  }
  return <FirebaseGate>{(identity) => <Joined identity={identity}>{children}</Joined>}</FirebaseGate>;
}

/* ───────────── chrome ───────────── */

/** Presence, follow and version banners. `surface` is the area whose interaction ends following. */
export function CollabHeader({ surface }: { surface?: RefObject<unknown> }) {
  const collab = useOptionalCollab();
  const router = useRouter();
  if (!collab) return null;
  return (
    <div style={{ background: "#151823", color: "#e6e8f0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 12px" }}>
        <PresenceBar
          onGoToStory={(s) => {
            const href = storyToHref(s);
            if (href) router.push(href as never);
          }}
        />
      </div>
      <FollowBanner canvas={surface as RefObject<HTMLElement | null> | undefined} />
      <VersionBanner currentSha={env.buildSha || undefined} />
    </div>
  );
}

/** Collapsible chat + comments panel docked at the right edge. */
export function CollabSidePanelHost() {
  const collab = useOptionalCollab();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  if (!collab) return null;
  const story = pathToStory(pathname) ?? "blocks/unknown";
  return (
    <div style={{ position: "relative", display: "flex", height: "100%" }}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{ position: open ? "static" : "absolute", right: 0, top: 8, zIndex: 60, writingMode: "vertical-rl", padding: "10px 4px", border: "none", background: "#262a3b", color: "#e6e8f0", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
      >
        {open ? "Hide" : "Chat & comments"}
      </button>
      {open ? (
        <CollabSidePanel
          story={story}
          project={env.projectName}
          baseSha={env.buildSha || undefined}
          onGoToStory={(s) => {
            const href = storyToHref(s);
            if (href) router.push(href as never);
          }}
        />
      ) : null}
    </div>
  );
}

/** Cursors and comment pins for one phone frame (normalised to the frame, so they are right at any zoom). */
export function CollabFrameLayers({ frame, story }: { frame: RefObject<unknown>; story: string }) {
  const collab = useOptionalCollab();
  if (!collab) return null;
  const el = frame as RefObject<HTMLElement | null>;
  return (
    <>
      <PinsLayer frame={el} story={story} />
      <CursorLayer frame={el} story={story} />
    </>
  );
}

/* ───────────── publishing what you are looking at ───────────── */

/** Single-frame pages (blocks): the story is the whole view. */
export function usePublishStory(story: string): void {
  const collab = useOptionalCollab();
  const client = collab?.client;
  useEffect(() => {
    pending = null; // a pending canvas view is meaningless on a page without a canvas
    client?.view({ story, zoom: 1, sx: 0, sy: 0 });
  }, [client, story]);
}

/** Canvas pages (flows): publish pan/zoom, and apply the view of the person you follow. Call inside `CanvasProvider`. */
export function useCanvasCollab(story: string): void {
  const collab = useOptionalCollab();
  const client = collab?.client;
  const { scale, translateX, translateY, viewport } = useCanvas();

  const publish = useCallback(
    (s: number, tx: number, ty: number, w: number, h: number) => {
      if (w > 0 && h > 0) client?.view(toDesignView(story, { scale: s, tx, ty }, { w, h }));
    },
    [client, story],
  );

  useAnimatedReaction(
    () => ({ s: scale.value, x: translateX.value, y: translateY.value, w: viewport.value.w, h: viewport.value.h }),
    (cur, prev) => {
      if (prev && cur.s === prev.s && cur.x === prev.x && cur.y === prev.y && cur.w === prev.w && cur.h === prev.h) return;
      runOnJS(publish)(cur.s, cur.x, cur.y, cur.w, cur.h);
    },
    [publish],
  );

  useEffect(
    () =>
      registerApplier((v) => {
        const t = fromDesignView(v, viewport.value);
        scale.value = t.scale;
        translateX.value = t.tx;
        translateY.value = t.ty;
      }),
    [scale, translateX, translateY, viewport],
  );
}
