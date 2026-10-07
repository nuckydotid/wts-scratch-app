// Copied from Worktrees Studio (src/shared/workspace) by `npm run template:sync-core`. Do not edit here.
/**
 * Shared virtual-workspace world model.
 *
 * Imported by both the desktop app (renderer + HUD) and the office server, so it
 * must stay free of DOM / Node specific APIs.
 */

export const TILE = 32;

export type Dir = 'down' | 'left' | 'right' | 'up';
export type PresenceStatus = 'available' | 'focus' | 'meeting' | 'away';
export type EntityKind = 'human' | 'agent';
export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'guest';

export interface Vec {
  x: number;
  y: number;
}

/* ───────────────────────── Map ───────────────────────── */

/** Floor tile ids (0 = void, not walkable). */
export const Floor = {
  Void: 0,
  Wood: 1,
  DarkWood: 2,
  CarpetBlue: 3,
  CarpetPurple: 4,
  CarpetGreen: 5,
  TileLight: 6,
  Concrete: 7,
  Grass: 8,
  Path: 9,
  CarpetWarm: 10,
} as const;
export type FloorId = (typeof Floor)[keyof typeof Floor];
export const FLOOR_IDS = Object.values(Floor) as number[];

/** Wall tile ids (0 = none). All non-zero walls block movement. */
export const Wall = {
  None: 0,
  Plaster: 1,
  Glass: 2,
  Hedge: 3,
  Brick: 4,
} as const;
export type WallId = (typeof Wall)[keyof typeof Wall];
export const WALL_IDS = Object.values(Wall) as number[];

export type ZoneKind = 'open' | 'private' | 'lounge' | 'outdoor' | 'lobby';

export interface MapZone {
  id: string;
  name: string;
  kind: ZoneKind;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Accent colour (hex) used for floor labels and the minimap. */
  color: string;
  /** Private zones isolate proximity chat from everyone outside the zone. */
  private?: boolean;
}

export type PropKind =
  | 'desk'
  | 'chair'
  | 'plant'
  | 'plantBig'
  | 'tree'
  | 'sofa'
  | 'coffeeBar'
  | 'roundTable'
  | 'meetingTable'
  | 'whiteboard'
  | 'branchBoard'
  | 'bookshelf'
  | 'fountain'
  | 'lamp'
  | 'rugBlue'
  | 'rugWarm'
  | 'terminal'
  | 'cooler'
  | 'reception'
  | 'window'
  | 'poster';

export interface MapProp {
  id: string;
  kind: PropKind;
  /** Top-left tile of the footprint. */
  x: number;
  y: number;
  /** Visual variant (accent colour index etc.). */
  variant?: number;
  label?: string;
}

export interface WorkspaceMap {
  id: string;
  name: string;
  width: number;
  height: number;
  /** Row-major floor ids, length = width * height. */
  floor: number[];
  /** Row-major wall ids, length = width * height. */
  wall: number[];
  zones: MapZone[];
  props: MapProp[];
  spawns: Vec[];
}

/* ───────────────────────── Entities ───────────────────────── */

export interface Appearance {
  skin: string;
  hair: string;
  hairStyle: number; // 0..HAIR_STYLES-1
  outfit: string;
  pants: string;
  accessory: number; // 0..ACCESSORIES-1
  /** Top style 0..OUTFIT_STYLES-1; absent (older clients) means 0. */
  outfitStyle?: number;
  /** Trousers style 0..PANTS_STYLES-1; absent means 0. */
  pantsStyle?: number;
}

export const HAIR_STYLE_NAMES = ['Short crop', 'Side swept', 'Long bob', 'Buzz', 'Bun', 'Curly', 'Long straight', 'Ponytail', 'Mohawk', 'Afro', 'Pigtails', 'Bald', 'Spiky', 'Pompadour'] as const;
export const ACCESSORY_NAMES = ['None', 'Glasses', 'Headphones', 'Cap', 'Sunglasses', 'Headband', 'Beanie', 'Mustache', 'Bow', 'Crown'] as const;
export const OUTFIT_STYLE_NAMES = ['Crew', 'Hoodie', 'Blazer', 'Striped', 'Tank', 'Overalls', 'Turtleneck', 'Polo'] as const;
export const PANTS_STYLE_NAMES = ['Long', 'Shorts', 'Skirt', 'Cropped', 'Cargo', 'Joggers'] as const;

export const HAIR_STYLES = HAIR_STYLE_NAMES.length;
export const ACCESSORIES = ACCESSORY_NAMES.length;
export const OUTFIT_STYLES = OUTFIT_STYLE_NAMES.length;
export const PANTS_STYLES = PANTS_STYLE_NAMES.length;

export interface GitActivity {
  repo: string;
  branch: string;
  dirty: number;
  ahead: number;
  behind: number;
  conflicts: number;
  state: 'idle' | 'dirty' | 'merging' | 'conflict';
}

export type EmoteKind =
  | 'wave'
  | 'heart'
  | 'clap'
  | 'coffee'
  | 'idea'
  | 'party'
  | 'think'
  | 'thumbsUp';

export const EMOTES: EmoteKind[] = [
  'wave',
  'heart',
  'clap',
  'coffee',
  'idea',
  'party',
  'think',
  'thumbsUp',
];

export interface PlayerState {
  id: string;
  kind: EntityKind;
  name: string;
  role?: string;
  x: number;
  y: number;
  dir: Dir;
  moving: boolean;
  /** Desk id when seated. */
  sitting: string | null;
  status: PresenceStatus;
  statusText?: string;
  emote?: { kind: EmoteKind; at: number } | null;
  look: Appearance;
  /** Owned desk id, if any. */
  desk: string | null;
  activity?: GitActivity | null;
  /** Agent id (agents only). */
  agentId?: string;
  /** True while an agent is generating a reply. */
  thinking?: boolean;
}

export type ChatScope = 'nearby' | 'room' | 'dm' | 'system';

export interface ChatMessage {
  id: string;
  scope: ChatScope;
  from: string; // player id
  fromName: string;
  to?: string;
  text: string;
  at: number;
  zone?: string;
}

/* ───────────────────────── Map editing ───────────────────────── */

export type EditOp =
  | { op: 'floor'; cells: [number, number, number][] }
  | { op: 'wall'; cells: [number, number, number][] }
  | { op: 'prop.add'; prop: MapProp }
  | { op: 'prop.remove'; id: string }
  | { op: 'prop.move'; id: string; x: number; y: number }
  | { op: 'zone.set'; zone: MapZone }
  | { op: 'zone.remove'; id: string };

/* ───────────────────────── Agents ───────────────────────── */

export interface AgentSpec {
  id: string;
  name: string;
  role: string;
  persona: string;
  systemPrompt: string;
  greeting?: string;
  homeZone?: string;
  look: Appearance;
  skills: { id: string; name: string; systemPrompt?: string }[];
}
