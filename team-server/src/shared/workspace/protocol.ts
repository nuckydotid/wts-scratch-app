// Copied from Worktrees Studio (src/shared/workspace) by `npm run template:sync-core`. Do not edit here.
import {
  ACCESSORIES,
  EMOTES,
  FLOOR_IDS,
  HAIR_STYLES,
  OUTFIT_STYLES,
  PANTS_STYLES,
  WALL_IDS,
} from './types.ts';
import type {
  Appearance,
  ChatMessage,
  Dir,
  EditOp,
  EmoteKind,
  GitActivity,
  MapProp,
  MapZone,
  PlayerState,
  PresenceStatus,
  WorkspaceMap,
  WorkspaceRole,
  AgentSpec,
} from './types.ts';
import { isPropKind } from './props.ts';

/* ───────────────────── Client → Server ───────────────────── */

export type ClientMsg =
  | { t: 'hello'; token: string; workspaceId: string; name: string; look: Appearance; invite?: string; github?: string }
  | { t: 'move'; x: number; y: number; dir: Dir; moving: boolean }
  | { t: 'sit'; deskId: string | null }
  | { t: 'emote'; emote: EmoteKind }
  | { t: 'status'; status: PresenceStatus; text?: string }
  | { t: 'activity'; activity: GitActivity | null }
  | { t: 'chat'; scope: 'nearby' | 'room' | 'dm'; to?: string; text: string }
  | { t: 'agent.chat'; agentId: string; text: string; skillId?: string; reqId: string }
  | { t: 'desk.claim'; deskId: string | null }
  | { t: 'edit'; op: EditOp }
  | { t: 'agents.sync'; agents: AgentSpec[] }
  | { t: 'ping'; at: number };

/* ───────────────────── Server → Client ───────────────────── */

export interface WelcomeMsg {
  t: 'welcome';
  you: string;
  role: WorkspaceRole;
  workspace: { id: string; name: string };
  map: WorkspaceMap;
  players: PlayerState[];
  /** deskId → ownerId */
  deskOwners: Record<string, string>;
  history: ChatMessage[];
  /** Only sent to owners/admins. */
  inviteCode?: string;
  serverTime: number;
}

/** Compact position tuple: [id, x, y, dir, moving(0/1)] */
export type PosTuple = [string, number, number, Dir, 0 | 1];

export type ServerMsg =
  | WelcomeMsg
  | { t: 'state'; time: number; p: PosTuple[] }
  | { t: 'join'; player: PlayerState }
  | { t: 'leave'; id: string }
  | { t: 'patch'; id: string; patch: Partial<PlayerState> }
  | { t: 'desk.owner'; deskId: string; ownerId: string | null }
  | { t: 'chat'; msg: ChatMessage }
  | { t: 'agent.delta'; reqId: string; agentId: string; text: string }
  | { t: 'agent.done'; reqId: string; agentId: string }
  | { t: 'agent.error'; reqId: string; agentId: string; message: string }
  | { t: 'correct'; x: number; y: number }
  | { t: 'map.edit'; op: EditOp; by: string }
  | { t: 'error'; code: string; message: string }
  | { t: 'pong'; at: number; serverTime: number };

/* ───────────────────── Limits ───────────────────── */

export const LIMITS = {
  chatText: 500,
  name: 32,
  statusText: 80,
  maxEditCells: 4096,
  maxMsgBytes: 256 * 1024,
  agentSpecs: 24,
} as const;

/* ───────────────────── Validation ───────────────────── */

const DIRS: Dir[] = ['down', 'left', 'right', 'up'];
const STATUSES: PresenceStatus[] = ['available', 'focus', 'meeting', 'away'];
const HEX = /^#[0-9a-fA-F]{6}$/;

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isStr = (v: unknown, max = 256): v is string => typeof v === 'string' && v.length <= max;
const isInt = (v: unknown): v is number => isNum(v) && Number.isInteger(v);

export function sanitizeText(s: string, max: number): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, max);
}

export function validAppearance(v: unknown): v is Appearance {
  return (
    isObj(v) &&
    typeof v.skin === 'string' && HEX.test(v.skin) &&
    typeof v.hair === 'string' && HEX.test(v.hair) &&
    typeof v.outfit === 'string' && HEX.test(v.outfit) &&
    typeof v.pants === 'string' && HEX.test(v.pants) &&
    isInt(v.hairStyle) && v.hairStyle >= 0 && v.hairStyle < HAIR_STYLES &&
    isInt(v.accessory) && v.accessory >= 0 && v.accessory < ACCESSORIES &&
    (v.outfitStyle === undefined || (isInt(v.outfitStyle) && v.outfitStyle >= 0 && v.outfitStyle < OUTFIT_STYLES)) &&
    (v.pantsStyle === undefined || (isInt(v.pantsStyle) && v.pantsStyle >= 0 && v.pantsStyle < PANTS_STYLES))
  );
}

export function validActivity(v: unknown): v is GitActivity {
  return (
    isObj(v) &&
    isStr(v.repo, 80) && isStr(v.branch, 120) &&
    isInt(v.dirty) && isInt(v.ahead) && isInt(v.behind) && isInt(v.conflicts) &&
    (v.state === 'idle' || v.state === 'dirty' || v.state === 'merging' || v.state === 'conflict')
  );
}

function validProp(v: unknown): v is MapProp {
  return (
    isObj(v) && isStr(v.id, 64) && isPropKind(v.kind) &&
    isInt(v.x) && isInt(v.y) &&
    (v.variant === undefined || isInt(v.variant)) &&
    (v.label === undefined || isStr(v.label, 40))
  );
}

function validZone(v: unknown): v is MapZone {
  return (
    isObj(v) && isStr(v.id, 40) && isStr(v.name, 40) &&
    (v.kind === 'open' || v.kind === 'private' || v.kind === 'lounge' || v.kind === 'outdoor' || v.kind === 'lobby') &&
    isInt(v.x) && isInt(v.y) && isInt(v.w) && isInt(v.h) && v.w > 0 && v.h > 0 &&
    typeof v.color === 'string' && HEX.test(v.color) &&
    (v.private === undefined || typeof v.private === 'boolean')
  );
}

function validCells(v: unknown, allowed: number[]): v is [number, number, number][] {
  return (
    Array.isArray(v) && v.length <= LIMITS.maxEditCells &&
    v.every(
      (c) =>
        Array.isArray(c) && c.length === 3 && isInt(c[0]) && isInt(c[1]) &&
        isInt(c[2]) && allowed.includes(c[2]),
    )
  );
}

export function validEditOp(v: unknown): v is EditOp {
  if (!isObj(v) || typeof v.op !== 'string') return false;
  switch (v.op) {
    case 'floor': return validCells(v.cells, FLOOR_IDS);
    case 'wall': return validCells(v.cells, WALL_IDS);
    case 'prop.add': return validProp(v.prop);
    case 'prop.remove': return isStr(v.id, 64);
    case 'prop.move': return isStr(v.id, 64) && isInt(v.x) && isInt(v.y);
    case 'zone.set': return validZone(v.zone);
    case 'zone.remove': return isStr(v.id, 40);
    default: return false;
  }
}

export function validAgentSpec(v: unknown): v is AgentSpec {
  return (
    isObj(v) && isStr(v.id, 64) && isStr(v.name, 64) && isStr(v.role, 80) &&
    isStr(v.persona, 4000) && isStr(v.systemPrompt, 20000) &&
    (v.greeting === undefined || isStr(v.greeting, 1000)) &&
    (v.homeZone === undefined || isStr(v.homeZone, 40)) &&
    validAppearance(v.look) &&
    Array.isArray(v.skills) && v.skills.length <= 40 &&
    v.skills.every(
      (s) => isObj(s) && isStr(s.id, 64) && isStr(s.name, 80) &&
        (s.systemPrompt === undefined || isStr(s.systemPrompt, 20000)),
    )
  );
}

/** Parse + validate an untrusted client frame. Returns null when invalid. */
export function parseClientMsg(raw: string): ClientMsg | null {
  if (raw.length > LIMITS.maxMsgBytes) return null;
  let v: unknown;
  try {
    v = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isObj(v) || typeof v.t !== 'string') return null;
  switch (v.t) {
    case 'hello':
      if (
        isStr(v.token, 4096) && isStr(v.workspaceId, 64) && /^[A-Za-z0-9_-]{1,64}$/.test(v.workspaceId) &&
        isStr(v.name, LIMITS.name * 2) && validAppearance(v.look) && (v.invite === undefined || isStr(v.invite, 64)) &&
        (v.github === undefined || isStr(v.github, 512))
      ) {
        const name = sanitizeText(v.name, LIMITS.name);
        if (!name) return null;
        return {
          t: 'hello', token: v.token, workspaceId: v.workspaceId, name, look: v.look,
          invite: typeof v.invite === 'string' ? v.invite : undefined,
          github: typeof v.github === 'string' ? v.github : undefined,
        };
      }
      return null;
    case 'move':
      if (isNum(v.x) && isNum(v.y) && DIRS.includes(v.dir as Dir) && typeof v.moving === 'boolean')
        return { t: 'move', x: v.x, y: v.y, dir: v.dir as Dir, moving: v.moving };
      return null;
    case 'sit':
      if (v.deskId === null || isStr(v.deskId, 64)) return { t: 'sit', deskId: v.deskId as string | null };
      return null;
    case 'emote':
      if (EMOTES.includes(v.emote as EmoteKind)) return { t: 'emote', emote: v.emote as EmoteKind };
      return null;
    case 'status':
      if (STATUSES.includes(v.status as PresenceStatus) && (v.text === undefined || isStr(v.text, LIMITS.statusText * 2)))
        return {
          t: 'status',
          status: v.status as PresenceStatus,
          text: typeof v.text === 'string' ? sanitizeText(v.text, LIMITS.statusText) : undefined,
        };
      return null;
    case 'activity':
      if (v.activity === null) return { t: 'activity', activity: null };
      if (validActivity(v.activity)) return { t: 'activity', activity: v.activity };
      return null;
    case 'chat':
      if ((v.scope === 'nearby' || v.scope === 'room' || v.scope === 'dm') && isStr(v.text, LIMITS.chatText * 2)) {
        const text = sanitizeText(v.text, LIMITS.chatText);
        if (!text) return null;
        if (v.scope === 'dm' && !isStr(v.to, 64)) return null;
        return { t: 'chat', scope: v.scope, to: typeof v.to === 'string' ? v.to : undefined, text };
      }
      return null;
    case 'agent.chat':
      if (isStr(v.agentId, 64) && isStr(v.text, LIMITS.chatText * 4) && isStr(v.reqId, 64) && (v.skillId === undefined || isStr(v.skillId, 64))) {
        const text = sanitizeText(v.text, LIMITS.chatText * 4);
        if (!text) return null;
        return { t: 'agent.chat', agentId: v.agentId, text, skillId: v.skillId as string | undefined, reqId: v.reqId };
      }
      return null;
    case 'desk.claim':
      if (v.deskId === null || isStr(v.deskId, 64)) return { t: 'desk.claim', deskId: v.deskId as string | null };
      return null;
    case 'edit':
      if (validEditOp(v.op)) return { t: 'edit', op: v.op };
      return null;
    case 'agents.sync':
      if (Array.isArray(v.agents) && v.agents.length <= LIMITS.agentSpecs && v.agents.every(validAgentSpec))
        return { t: 'agents.sync', agents: v.agents as AgentSpec[] };
      return null;
    case 'ping':
      if (isNum(v.at)) return { t: 'ping', at: v.at };
      return null;
    default:
      return null;
  }
}

/** Apply a validated edit op to a map (mutates). Returns false if it had no effect. */
export function applyEditOp(map: WorkspaceMap, op: EditOp): boolean {
  const { width: w, height: h } = map;
  const inb = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h;
  switch (op.op) {
    case 'floor':
    case 'wall': {
      const layer = op.op === 'floor' ? map.floor : map.wall;
      let changed = false;
      for (const [x, y, id] of op.cells) {
        if (!inb(x, y)) continue;
        if (layer[y * w + x] !== id) {
          layer[y * w + x] = id;
          changed = true;
        }
      }
      return changed;
    }
    case 'prop.add':
      if (!inb(op.prop.x, op.prop.y) || map.props.some((p) => p.id === op.prop.id)) return false;
      map.props.push({ ...op.prop });
      return true;
    case 'prop.remove': {
      const i = map.props.findIndex((p) => p.id === op.id);
      if (i < 0) return false;
      map.props.splice(i, 1);
      return true;
    }
    case 'prop.move': {
      const p = map.props.find((q) => q.id === op.id);
      if (!p || !inb(op.x, op.y)) return false;
      p.x = op.x;
      p.y = op.y;
      return true;
    }
    case 'zone.set': {
      const i = map.zones.findIndex((z) => z.id === op.zone.id);
      if (i >= 0) map.zones[i] = { ...op.zone };
      else map.zones.push({ ...op.zone });
      return true;
    }
    case 'zone.remove': {
      const i = map.zones.findIndex((z) => z.id === op.id);
      if (i < 0) return false;
      map.zones.splice(i, 1);
      return true;
    }
  }
}
