// Copied from Worktrees Studio (src/shared/workspace) by `npm run template:sync-core`. Do not edit here.
import { Floor, Wall } from './types.ts';
import type { MapProp, MapZone, PropKind, WorkspaceMap } from './types.ts';

/**
 * "HQ Studio" — the default 64×42 office.
 *
 *   ┌──────────── Frontend Lab ────┬──── Backend Bay ────┬──── QA Corner ───┐
 *   ├──────────── Design Studio ───┼── Plaza + Branch ───┼── Café & Lounge ─┤
 *   ├─ Standup ─┬ Booths ┬─────────┼──────── Lobby ──────┼──── War Room ────┤
 *   └───────────┴────────┴─────────┴────── (entrance) ────┴──────────────────┘
 *                         Courtyard (fountain, trees)
 */
export const DEFAULT_MAP_ID = 'hq-studio';

const W = 64;
const H = 42;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function buildDefaultMap(): WorkspaceMap {
  const floor = new Array<number>(W * H).fill(Floor.Grass);
  const wall = new Array<number>(W * H).fill(Wall.None);
  const props: MapProp[] = [];
  let seq = 0;

  const setFloor = (r: Rect, id: number) => {
    for (let y = r.y; y < r.y + r.h; y++)
      for (let x = r.x; x < r.x + r.w; x++) floor[y * W + x] = id;
  };
  const setWall = (x: number, y: number, id: number) => {
    wall[y * W + x] = id;
  };
  /** Doorways get a neutral floor instead of the outdoor grass fill. */
  const doorway = (x: number, y: number) => {
    if (floor[y * W + x] === Floor.Grass) floor[y * W + x] = Floor.Wood;
  };
  const hWall = (x0: number, x1: number, y: number, id: number, gaps: [number, number][] = []) => {
    for (let x = x0; x <= x1; x++) {
      if (gaps.some(([a, b]) => x >= a && x <= b)) {
        doorway(x, y);
        continue;
      }
      setWall(x, y, id);
    }
  };
  const vWall = (x: number, y0: number, y1: number, id: number, gaps: [number, number][] = []) => {
    for (let y = y0; y <= y1; y++) {
      if (gaps.some(([a, b]) => y >= a && y <= b)) {
        doorway(x, y);
        continue;
      }
      setWall(x, y, id);
    }
  };
  const add = (kind: PropKind, x: number, y: number, variant = 0, label?: string) => {
    props.push({ id: `${kind}-${++seq}`, kind, x, y, variant, ...(label ? { label } : {}) });
  };

  /* ── Courtyard & paths ── */
  setFloor({ x: 24, y: 34, w: 16, h: 2 }, Floor.Path);
  setFloor({ x: 30, y: 33, w: 4, h: 1 }, Floor.Path);
  setFloor({ x: 2, y: 36, w: 60, h: 1 }, Floor.Grass);

  /* ── Building interior floors ── */
  setFloor({ x: 2, y: 2, w: 20, h: 12 }, Floor.CarpetBlue); // frontend
  setFloor({ x: 23, y: 2, w: 19, h: 12 }, Floor.CarpetGreen); // backend
  setFloor({ x: 43, y: 2, w: 19, h: 12 }, Floor.CarpetWarm); // qa
  setFloor({ x: 2, y: 15, w: 20, h: 8 }, Floor.CarpetPurple); // design
  setFloor({ x: 23, y: 15, w: 19, h: 8 }, Floor.Concrete); // plaza
  setFloor({ x: 43, y: 15, w: 19, h: 8 }, Floor.TileLight); // café
  setFloor({ x: 2, y: 24, w: 9, h: 9 }, Floor.DarkWood); // standup
  setFloor({ x: 12, y: 24, w: 5, h: 9 }, Floor.Wood); // booth a
  setFloor({ x: 18, y: 24, w: 4, h: 9 }, Floor.Wood); // booth b
  setFloor({ x: 23, y: 24, w: 19, h: 9 }, Floor.Wood); // lobby
  setFloor({ x: 43, y: 24, w: 19, h: 9 }, Floor.DarkWood); // war room

  /* ── Shell walls ── */
  hWall(1, 62, 1, Wall.Plaster);
  hWall(1, 62, 33, Wall.Plaster, [[30, 33]]);
  vWall(1, 1, 33, Wall.Plaster);
  vWall(62, 1, 33, Wall.Plaster);

  /* ── Room dividers ── */
  const doors = (ys: [number, number]) => [ys];
  vWall(22, 2, 13, Wall.Glass, doors([6, 8]));
  vWall(42, 2, 13, Wall.Glass, doors([6, 8]));
  vWall(22, 15, 22, Wall.Glass, doors([18, 20]));
  vWall(42, 15, 22, Wall.Glass, doors([18, 20]));
  vWall(22, 24, 32, Wall.Glass, doors([27, 29]));
  vWall(42, 24, 32, Wall.Glass, doors([27, 29]));
  hWall(2, 61, 14, Wall.Plaster, [[10, 12], [30, 34], [50, 52]]);
  hWall(2, 61, 23, Wall.Plaster, [[5, 7], [13, 15], [19, 20], [30, 34], [44, 46]]);
  vWall(11, 24, 32, Wall.Glass);
  vWall(17, 24, 32, Wall.Glass);

  /* ── Floor under interior walls: borrow the neighbouring room's floor so no grass peeks out ── */
  for (let y = 1; y < 34; y++) {
    for (let x = 1; x < 63; x++) {
      if (wall[y * W + x] === Wall.None || floor[y * W + x] !== Floor.Grass) continue;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const f = floor[(y + dy) * W + (x + dx)];
        if (f !== Floor.Grass && f !== Floor.Void && f !== Floor.Path) {
          floor[y * W + x] = f;
          break;
        }
      }
    }
  }

  /* ── Perimeter hedges ── */
  hWall(0, W - 1, 0, Wall.Hedge);
  hWall(0, W - 1, H - 1, Wall.Hedge);
  vWall(0, 0, H - 1, Wall.Hedge);
  vWall(W - 1, 0, H - 1, Wall.Hedge);

  /* ── Desk clusters ── */
  const deskRow = (xs: number[], y: number, variantBase = 0) => {
    xs.forEach((x, i) => {
      add('desk', x, y, (variantBase + i) % 4);
      add('chair', x + 1, y + 1, (variantBase + i) % 4);
    });
  };
  deskRow([3, 7, 11], 4);
  deskRow([3, 7, 11], 10, 1);
  deskRow([24, 28, 32], 4, 2);
  deskRow([24, 28, 32], 10, 3);
  deskRow([44, 48, 52], 4, 1);
  deskRow([44, 48], 10, 2);
  deskRow([3, 7, 11], 17, 3);
  deskRow([3, 7, 11], 20, 0);
  deskRow([25, 37], 18, 1); // plaza strategy desks

  /* ── Frontend lab dressing ── */
  add('bookshelf', 17, 2, 0);
  add('plantBig', 20, 2);
  add('plant', 15, 12);
  add('whiteboard', 16, 6);
  add('lamp', 20, 12);
  for (const x of [5, 9, 13, 17]) add('window', x, 1, x % 2);
  /* ── Backend bay ── */
  add('terminal', 38, 2);
  add('terminal', 40, 2);
  add('bookshelf', 35, 2, 1);
  add('plant', 40, 12);
  add('lamp', 29, 7);
  for (const x of [25, 29, 33, 37]) add('window', x, 1, (x + 1) % 2);
  /* ── QA corner ── */
  add('whiteboard', 56, 2);
  add('plantBig', 60, 2);
  add('plant', 59, 12);
  add('sofa', 55, 10, 1);
  add('terminal', 47, 12);
  for (const x of [45, 49, 53, 57]) add('window', x, 1, x % 2);
  /* ── Design studio ── */
  add('whiteboard', 15, 15);
  add('bookshelf', 19, 15, 1);
  add('plant', 2, 15);
  add('plantBig', 20, 21);
  add('lamp', 15, 21);
  add('rugBlue', 15, 18);
  add('poster', 5, 14, 0);
  add('poster', 8, 14, 1);

  /* ── Plaza ── */
  add('branchBoard', 29, 15);
  add('plantBig', 24, 16);
  add('plantBig', 40, 16);
  add('lamp', 24, 21);
  add('lamp', 40, 21);
  add('roundTable', 31, 19);
  add('rugBlue', 29, 18);
  /* ── Café ── */
  add('coffeeBar', 46, 15);
  add('cooler', 51, 15);
  add('sofa', 56, 15, 0);
  add('roundTable', 45, 19);
  add('roundTable', 50, 20);
  add('plantBig', 60, 16);
  add('plant', 44, 21);
  add('lamp', 54, 21);
  add('rugWarm', 55, 18);
  add('poster', 45, 14, 2);
  add('poster', 57, 14, 3);
  /* ── Standup ── */
  add('whiteboard', 4, 24);
  add('rugBlue', 4, 28);
  add('plant', 2, 31);
  add('plant', 10, 31);
  add('lamp', 9, 25);
  /* ── Focus booths ── */
  add('sofa', 13, 29, 2);
  add('plant', 12, 25);
  add('lamp', 16, 25);
  add('rugWarm', 12, 26);
  add('desk', 19, 26, 2);
  add('chair', 20, 27, 2);
  add('plant', 18, 31);
  /* ── Lobby ── */
  add('reception', 24, 25);
  add('plantBig', 24, 31);
  add('plantBig', 41, 31);
  add('sofa', 37, 25, 0);
  add('sofa', 37, 30, 2);
  add('lamp', 27, 31);
  add('lamp', 39, 27);
  add('rugBlue', 30, 28);
  add('poster', 25, 23, 1);
  add('poster', 38, 23, 3);
  /* ── War room ── */
  add('meetingTable', 49, 27);
  for (const x of [50, 51, 52, 53]) {
    add('chair', x, 26, x % 4);
    add('chair', x, 29, (x + 1) % 4);
  }
  add('whiteboard', 55, 24);
  add('bookshelf', 59, 24, 1);
  add('plantBig', 60, 31);
  add('lamp', 44, 31);

  /* ── Courtyard ── */
  add('fountain', 31, 37);
  for (const [x, y] of [[4, 36], [10, 38], [16, 36], [22, 38], [42, 38], [48, 36], [54, 38], [59, 36], [7, 40], [56, 40]] as const)
    add('tree', x, y, (x + y) % 2);
  for (const [x, y] of [[26, 38], [28, 36], [36, 38], [38, 36]] as const) add('plant', x, y, 2);

  const zones: MapZone[] = [
    { id: 'frontend', name: 'Frontend Lab', kind: 'open', x: 2, y: 2, w: 20, h: 12, color: '#7aa2f7' },
    { id: 'backend', name: 'Backend Bay', kind: 'open', x: 23, y: 2, w: 19, h: 12, color: '#9ece6a' },
    { id: 'qa', name: 'QA Corner', kind: 'open', x: 43, y: 2, w: 19, h: 12, color: '#e0af68' },
    { id: 'design', name: 'Design Studio', kind: 'open', x: 2, y: 15, w: 20, h: 8, color: '#a06fe0' },
    { id: 'plaza', name: 'Plaza', kind: 'open', x: 23, y: 15, w: 19, h: 8, color: '#9aa1b5' },
    { id: 'cafe', name: 'Café & Lounge', kind: 'lounge', x: 43, y: 15, w: 19, h: 8, color: '#ff9e64' },
    { id: 'standup', name: 'Standup Room', kind: 'private', x: 2, y: 24, w: 9, h: 9, color: '#f7768e', private: true },
    { id: 'boothA', name: 'Focus Booth A', kind: 'private', x: 12, y: 24, w: 5, h: 9, color: '#f7768e', private: true },
    { id: 'boothB', name: 'Focus Booth B', kind: 'private', x: 18, y: 24, w: 4, h: 9, color: '#f7768e', private: true },
    { id: 'lobby', name: 'Lobby', kind: 'lobby', x: 23, y: 24, w: 19, h: 9, color: '#e6e8f0' },
    { id: 'war', name: 'War Room', kind: 'private', x: 43, y: 24, w: 19, h: 9, color: '#f7768e', private: true },
    { id: 'courtyard', name: 'Courtyard', kind: 'outdoor', x: 1, y: 34, w: 62, h: 7, color: '#73daca' },
  ];

  return {
    id: DEFAULT_MAP_ID,
    name: 'HQ Studio',
    width: W,
    height: H,
    floor,
    wall,
    zones,
    props,
    spawns: [
      { x: 30.5, y: 30.5 },
      { x: 31.5, y: 30.5 },
      { x: 32.5, y: 30.5 },
      { x: 33.5, y: 30.5 },
      { x: 31, y: 31.5 },
      { x: 33, y: 31.5 },
    ],
  };
}

/** Zone containing a tile position (smallest area wins; private beats open). */
export function zoneAt(map: Pick<WorkspaceMap, 'zones'>, x: number, y: number): MapZone | null {
  let best: MapZone | null = null;
  for (const z of map.zones) {
    if (x >= z.x && y >= z.y && x < z.x + z.w && y < z.y + z.h) {
      if (!best || z.w * z.h < best.w * best.h) best = z;
    }
  }
  return best;
}
