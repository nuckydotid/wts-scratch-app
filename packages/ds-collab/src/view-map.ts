import type { DesignView } from './core/protocol.ts';

/** The story canvas pans and zooms: `translate` in CSS pixels, `scale` is the zoom factor (the canvas clamps it to 0.1–2). */
export interface CanvasTransform {
  scale: number;
  tx: number;
  ty: number;
}

export interface Viewport {
  w: number;
  h: number;
}

export const CANVAS_ZOOM_MIN = 0.1;
export const CANVAS_ZOOM_MAX = 2;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const dim = (n: number) => (Number.isFinite(n) && n > 0 ? n : 1);

/**
 * What to publish so teammates can follow. Scroll is sent as a fraction of the viewport, so someone on a
 * different window size lands on the same part of the canvas.
 */
export function toDesignView(story: string, t: CanvasTransform, vp: Viewport): DesignView {
  return { story, zoom: t.scale, sx: t.tx / dim(vp.w), sy: t.ty / dim(vp.h) };
}

/** Inverse of `toDesignView` for the follower's own viewport; zoom is clamped to what the canvas supports. */
export function fromDesignView(v: DesignView, vp: Viewport): CanvasTransform {
  return { scale: clamp(v.zoom, CANVAS_ZOOM_MIN, CANVAS_ZOOM_MAX), tx: v.sx * dim(vp.w), ty: v.sy * dim(vp.h) };
}

/** `blocks/<name>` or `flows/<name>` → the Expo Router path of that story page, or null for anything else. */
export function storyToHref(story: string): string | null {
  const m = /^(blocks|flows)\/([A-Za-z0-9_.-]{1,64})$/.exec(story);
  return m ? `/expo-story/${m[1]}/${m[2]}` : null;
}

/** Inverse of `storyToHref` for a pathname such as `/expo-story/blocks/block-chat-bubble`. */
export function pathToStory(pathname: string): string | null {
  const m = /^\/expo-story\/(blocks|flows)\/([A-Za-z0-9_.-]{1,64})\/?$/.exec(pathname);
  return m ? `${m[1]}/${m[2]}` : null;
}

/** Two views are close enough that re-applying one would be a no-op (avoids feedback loops while following). */
export function sameView(a: DesignView, b: DesignView, eps = 0.002): boolean {
  return a.story === b.story && Math.abs(a.zoom - b.zoom) < eps && Math.abs(a.sx - b.sx) < eps && Math.abs(a.sy - b.sy) < eps;
}

/** Short commit ids from different tools (7 vs 40 chars) refer to the same commit when one prefixes the other. */
export function sameSha(a: string, b: string): boolean {
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  return x.length >= 7 && y.length >= 7 && (x.startsWith(y) || y.startsWith(x));
}
