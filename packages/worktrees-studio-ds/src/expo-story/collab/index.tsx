import type { ReactNode, RefObject } from "react";

/**
 * Realtime collaboration (cursors, follow, chat, comments) exists on web only — see `index.web.tsx`.
 * These no-ops keep the story shell identical on native.
 */
export const collabAvailable = false;

export function StoryCollabProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
export function CollabHeader(_props: { surface?: RefObject<unknown> }): null {
  return null;
}
export function CollabSidePanelHost(): null {
  return null;
}
export function CollabFrameLayers(_props: { frame: RefObject<unknown>; story: string }): null {
  return null;
}
export function usePublishStory(_story: string): void {}
export function useCanvasCollab(_story: string): void {}
