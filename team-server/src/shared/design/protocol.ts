// Copied from Worktrees Studio (src/shared/design) by `npm run template:sync-core`. Do not edit here.
/**
 * Design room protocol: realtime presence, cursors, "follow" mode, chat and pinned comments for the
 * shared design-system story web. Self-contained (no imports outside this folder) because the template
 * repo ships a copy of this folder inside its `ds-collab` package.
 */

export const DESIGN_COLORS = ['#7aa2f7', '#f7768e', '#9ece6a', '#e0af68', '#bb9af7', '#73daca', '#ff9e64', '#2ac3de', '#d98ac4', '#c3e88d'] as const;

/** Structurally the same as the office `Appearance`, kept local so this folder stays self-contained. */
export interface DesignLook {
  skin: string;
  hair: string;
  hairStyle: number;
  outfit: string;
  pants: string;
  accessory: number;
  outfitStyle?: number;
  pantsStyle?: number;
}

/** What a participant is looking at; followers copy it. `sx`/`sy` are scroll offsets normalised to the canvas. */
export interface DesignView {
  story: string;
  zoom: number;
  sx: number;
  sy: number;
}

export interface DesignPeer {
  /** Connection id (one per open tab). */
  id: string;
  uid: string;
  name: string;
  color: string;
  look?: DesignLook;
  story: string | null;
  view: DesignView | null;
  /** Connection id of the peer being followed. */
  following: string | null;
}

export interface DesignPin {
  id: string;
  story: string;
  /** Position inside the story frame, 0..1 (may exceed that slightly for marks outside the frame). */
  x: number;
  y: number;
  text: string;
  by: { uid: string; name: string; color: string };
  at: number;
  resolved: boolean;
}

export interface DesignChatMsg {
  id: string;
  from: string;
  fromName: string;
  color: string;
  text: string;
  story?: string;
  at: number;
}

/** A deployment of the design site announced by CI: a per-PR preview or the live site after a merge. */
export interface DesignVersion {
  kind: 'preview' | 'live';
  /** https address of the deployment (a preview channel host or the project's design site). */
  url: string;
  /** Commit the deployment was built from. */
  sha: string;
  /** Pull request number (previews). */
  pr?: number;
  at: number;
}

/** Lifecycle of a pull request (for example the one Jules opened), from the GitHub webhook. */
export interface DesignPrEvent {
  pr: number;
  url: string;
  state: 'open' | 'closed' | 'merged';
  /** Head branch (`design/<date>-<slug>` for hand-offs). */
  branch?: string;
  title?: string;
  at: number;
}

export const DESIGN_LIMITS = {
  /** Open preview deployments remembered per project. */
  previews: 5,
  /** Pull request events remembered per project. */
  prs: 20,
  chat: 1000,
  pin: 500,
  pins: 200,
  history: 100,
  name: 40,
  story: 80,
  coordMin: -5,
  coordMax: 6,
  zoomMin: 0.05,
  zoomMax: 16,
  frame: 32 * 1024,
} as const;

/* ───────────── Client → Server ───────────── */

export type DesignClientMsg =
  | { t: 'hello'; token: string; projectId: string; name: string; look?: DesignLook; github?: string }
  | { t: 'cursor'; story: string; x: number; y: number }
  | { t: 'view'; view: DesignView }
  | { t: 'follow'; target: string | null }
  | { t: 'chat'; text: string; story?: string }
  | { t: 'pin.add'; story: string; x: number; y: number; text: string }
  | { t: 'pin.update'; id: string; text?: string; resolved?: boolean }
  | { t: 'pin.del'; id: string }
  | { t: 'ping'; at: number };

/* ───────────── Server → Client ───────────── */

export type DesignServerMsg =
  | { t: 'welcome'; you: string; color: string; role: string; peers: DesignPeer[]; pins: DesignPin[]; history: DesignChatMsg[]; live?: DesignVersion | null; previews?: DesignVersion[]; prs?: DesignPrEvent[] }
  | { t: 'join'; peer: DesignPeer }
  | { t: 'leave'; id: string }
  | { t: 'peer'; id: string; patch: Partial<Pick<DesignPeer, 'story' | 'view' | 'following'>> }
  /** Batched cursor positions: [peerId, story, x, y]. Never contains the receiver's own cursor. */
  | { t: 'cursors'; c: [string, string, number, number][] }
  | { t: 'chat'; msg: DesignChatMsg }
  | { t: 'pin'; op: 'add' | 'update'; pin: DesignPin }
  | { t: 'pin'; op: 'del'; id: string }
  /** CI announced a deployment: everyone in the room (and every open site) can offer "new version — reload". */
  | { t: 'version'; version: DesignVersion }
  | { t: 'pr'; pr: DesignPrEvent }
  | { t: 'error'; code: string; message: string }
  | { t: 'pong'; at: number };

/* ───────────── validation ───────────── */

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isStr = (v: unknown, max: number): v is string => typeof v === 'string' && v.length <= max;
const STORY_RE = /^[A-Za-z0-9_.:/#-]{1,80}$/;
const HEX = /^#[0-9a-fA-F]{6}$/;
const ID_RE = /^[A-Za-z0-9_~:.-]{1,160}$/;

/** Story ids are opaque labels (`button/primary`); path tricks are rejected so they are safe to log and store. */
export const isStoryId = (v: unknown): v is string => typeof v === 'string' && STORY_RE.test(v) && !v.includes('..') && !v.startsWith('/');
const inRange = (v: unknown, lo: number, hi: number): v is number => isNum(v) && v >= lo && v <= hi;
const coord = (v: unknown): v is number => inRange(v, DESIGN_LIMITS.coordMin, DESIGN_LIMITS.coordMax);

const SHA_RE = /^[0-9a-f]{7,40}$/;
const isHttps = (v: unknown): v is string => {
  if (typeof v !== 'string' || v.length > 300) return false;
  try {
    const u = new URL(v);
    return u.protocol === 'https:' && !u.username && !u.password;
  } catch {
    return false;
  }
};

/** Validate an untrusted deployment announcement (hook body) and return it normalised, or null. */
export function parseDesignVersion(v: unknown, now = Date.now()): DesignVersion | null {
  if (!isObj(v) || (v.kind !== 'preview' && v.kind !== 'live') || !isHttps(v.url) || typeof v.sha !== 'string' || !SHA_RE.test(v.sha)) return null;
  if (v.pr !== undefined && !(Number.isInteger(v.pr) && (v.pr as number) > 0 && (v.pr as number) < 1e7)) return null;
  if (v.kind === 'preview' && v.pr === undefined) return null;
  return { kind: v.kind, url: new URL(v.url).href, sha: v.sha, ...(v.pr === undefined ? {} : { pr: v.pr as number }), at: now };
}

/** Strip control characters, collapse nothing else; trims and caps the length. */
export function cleanText(s: string, max: number): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, max);
}

export function validLook(v: unknown): v is DesignLook {
  return (
    isObj(v) &&
    typeof v.skin === 'string' && HEX.test(v.skin) &&
    typeof v.hair === 'string' && HEX.test(v.hair) &&
    typeof v.outfit === 'string' && HEX.test(v.outfit) &&
    typeof v.pants === 'string' && HEX.test(v.pants) &&
    Number.isInteger(v.hairStyle) && Number.isInteger(v.accessory) &&
    (v.outfitStyle === undefined || Number.isInteger(v.outfitStyle)) &&
    (v.pantsStyle === undefined || Number.isInteger(v.pantsStyle))
  );
}

export function validView(v: unknown): v is DesignView {
  return isObj(v) && isStoryId(v.story) && inRange(v.zoom, DESIGN_LIMITS.zoomMin, DESIGN_LIMITS.zoomMax) && inRange(v.sx, -1e4, 1e4) && inRange(v.sy, -1e4, 1e4);
}

export function parseDesignClientMsg(raw: string): DesignClientMsg | null {
  if (raw.length > DESIGN_LIMITS.frame) return null;
  let v: unknown;
  try {
    v = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isObj(v) || typeof v.t !== 'string') return null;
  switch (v.t) {
    case 'hello': {
      if (!isStr(v.token, 4096) || !isStr(v.projectId, 160) || !ID_RE.test(v.projectId) || !isStr(v.name, 200)) return null;
      if (v.look !== undefined && !validLook(v.look)) return null;
      if (v.github !== undefined && !isStr(v.github, 512)) return null;
      return {
        t: 'hello', token: v.token, projectId: v.projectId, name: cleanText(v.name, DESIGN_LIMITS.name), look: v.look as DesignLook | undefined,
        github: typeof v.github === 'string' ? v.github : undefined,
      };
    }
    case 'cursor':
      return isStoryId(v.story) && coord(v.x) && coord(v.y) ? { t: 'cursor', story: v.story, x: v.x, y: v.y } : null;
    case 'view':
      return validView(v.view) ? { t: 'view', view: { story: v.view.story, zoom: v.view.zoom, sx: v.view.sx, sy: v.view.sy } } : null;
    case 'follow':
      if (v.target === null) return { t: 'follow', target: null };
      return typeof v.target === 'string' && ID_RE.test(v.target) ? { t: 'follow', target: v.target } : null;
    case 'chat': {
      if (typeof v.text !== 'string') return null;
      const text = cleanText(v.text, DESIGN_LIMITS.chat);
      if (!text) return null;
      if (v.story !== undefined && !isStoryId(v.story)) return null;
      return { t: 'chat', text, story: v.story as string | undefined };
    }
    case 'pin.add': {
      if (!isStoryId(v.story) || !coord(v.x) || !coord(v.y) || typeof v.text !== 'string') return null;
      const text = cleanText(v.text, DESIGN_LIMITS.pin);
      return text ? { t: 'pin.add', story: v.story, x: v.x, y: v.y, text } : null;
    }
    case 'pin.update': {
      if (typeof v.id !== 'string' || !ID_RE.test(v.id)) return null;
      const out: Extract<DesignClientMsg, { t: 'pin.update' }> = { t: 'pin.update', id: v.id };
      if (v.text !== undefined) {
        if (typeof v.text !== 'string') return null;
        const text = cleanText(v.text, DESIGN_LIMITS.pin);
        if (!text) return null;
        out.text = text;
      }
      if (v.resolved !== undefined) {
        if (typeof v.resolved !== 'boolean') return null;
        out.resolved = v.resolved;
      }
      return out.text === undefined && out.resolved === undefined ? null : out;
    }
    case 'pin.del':
      return typeof v.id === 'string' && ID_RE.test(v.id) ? { t: 'pin.del', id: v.id } : null;
    case 'ping':
      return isNum(v.at) ? { t: 'ping', at: v.at } : null;
    default:
      return null;
  }
}
