// Copied from Worktrees Studio (src/shared/workspace) by `npm run template:sync-core`. Do not edit here.
import { PLAYER_SPEED, dirFromDelta, dist, findPath, moveWithCollision, nearestFree } from './grid.ts';
import type { Grid } from './grid.ts';
import { deskSeat } from './props.ts';
import type { AgentSpec, Dir, EmoteKind, PlayerState, Vec, WorkspaceMap } from './types.ts';
import { zoneAt } from './default-map.ts';

/** Assign each agent a desk, preferring free desks inside its home zone. */
export function assignAgentDesks(
  map: WorkspaceMap,
  agents: Pick<AgentSpec, 'id' | 'homeZone'>[],
  taken: Set<string>,
): Record<string, string> {
  const desks = map.props.filter((p) => p.kind === 'desk');
  const out: Record<string, string> = {};
  for (const a of agents) {
    const inZone = desks.filter(
      (d) => !taken.has(d.id) && (!a.homeZone || zoneAt(map, d.x + 1, d.y)?.id === a.homeZone),
    );
    const pick = inZone[0] ?? desks.find((d) => !taken.has(d.id));
    if (pick) {
      out[a.id] = pick.id;
      taken.add(pick.id);
    }
  }
  return out;
}

type Mode = 'seated' | 'walking' | 'lingering' | 'summoned' | 'waiting';

interface Runtime {
  mode: Mode;
  path: Vec[];
  timer: number;
  then: Mode | null;
  followId: string | null;
}

export interface NpcHooks {
  /** Called whenever a non-positional field of an NPC changes. */
  patch(id: string, patch: Partial<PlayerState>): void;
}

const NPC_SPEED = PLAYER_SPEED * 0.62;
const IDLE_EMOTES: EmoteKind[] = ['coffee', 'idea', 'think', 'wave'];

/**
 * Lightweight behaviour director for agent NPCs. Shared by the server (authoritative)
 * and the offline LocalRoom so both feel identical.
 */
export class NpcDirector {
  private rt = new Map<string, Runtime>();

  constructor(
    private map: WorkspaceMap,
    private grid: Grid,
    private hooks: NpcHooks,
    private rng: () => number = Math.random,
  ) {}

  setMap(map: WorkspaceMap, grid: Grid) {
    this.map = map;
    this.grid = grid;
  }

  add(npc: PlayerState) {
    this.rt.set(npc.id, {
      mode: npc.sitting ? 'seated' : 'lingering',
      path: [],
      timer: 4 + this.rng() * 18,
      then: null,
      followId: null,
    });
  }

  remove(id: string) {
    this.rt.delete(id);
  }

  /** Walk an agent to stand near a player and wait for them. */
  summon(npc: PlayerState, target: Vec, desks: Map<string, { x: number; y: number }>) {
    const r = this.rt.get(npc.id);
    if (!r) return;
    this.standUp(npc);
    const goal = this.standSpotNear(target);
    const path = goal && findPath(this.grid, npc, goal);
    r.path = path ?? [];
    r.mode = 'summoned';
    r.timer = 45;
    void desks;
  }

  /** Pause wandering while the agent is busy (e.g. generating a reply). */
  setBusy(npc: PlayerState, busy: boolean) {
    const r = this.rt.get(npc.id);
    if (!r) return;
    if (npc.thinking !== busy) {
      npc.thinking = busy;
      this.hooks.patch(npc.id, { thinking: busy });
    }
    if (busy) {
      r.mode = r.mode === 'seated' ? 'seated' : 'waiting';
      r.timer = 3600;
      if (r.mode === 'waiting') r.path = [];
    } else {
      r.timer = 8 + this.rng() * 14;
      if (r.mode === 'waiting') r.mode = 'lingering';
    }
  }

  update(
    dt: number,
    npcs: PlayerState[],
    deskById: (id: string) => { x: number; y: number } | null,
  ) {
    for (const npc of npcs) {
      const r = this.rt.get(npc.id);
      if (!r) continue;
      this.tickOne(dt, npc, r, deskById);
    }
  }

  private tickOne(
    dt: number,
    npc: PlayerState,
    r: Runtime,
    deskById: (id: string) => { x: number; y: number } | null,
  ) {
    if (npc.thinking) {
      npc.moving = false;
      return;
    }
    switch (r.mode) {
      case 'seated': {
        npc.moving = false;
        r.timer -= dt;
        if (r.timer <= 0) this.wander(npc, r);
        break;
      }
      case 'lingering': {
        npc.moving = false;
        r.timer -= dt;
        if (this.rng() < dt * 0.03) this.emote(npc);
        if (r.timer <= 0) {
          if (npc.desk && this.rng() < 0.65) this.goHome(npc, r, deskById);
          else this.wander(npc, r);
        }
        break;
      }
      case 'waiting': {
        npc.moving = false;
        break;
      }
      case 'summoned':
      case 'walking': {
        const arrived = this.follow(dt, npc, r);
        if (arrived) {
          if (r.mode === 'summoned') {
            r.mode = 'waiting';
            r.timer = 60;
            this.hooks.patch(npc.id, { emote: { kind: 'wave', at: Date.now() } });
            npc.emote = { kind: 'wave', at: Date.now() };
          } else if (r.then === 'seated' && npc.desk) {
            const d = deskById(npc.desk);
            if (d) this.sitAt(npc, d);
            r.mode = 'seated';
            r.timer = 25 + this.rng() * 50;
          } else {
            r.mode = 'lingering';
            r.timer = 6 + this.rng() * 12;
          }
          r.then = null;
        }
        break;
      }
    }
    if (r.mode === 'waiting' && !npc.thinking) {
      r.timer -= dt;
      if (r.timer <= 0) this.goHome(npc, r, deskById);
    }
  }

  private emote(npc: PlayerState) {
    const kind = IDLE_EMOTES[Math.floor(this.rng() * IDLE_EMOTES.length)];
    npc.emote = { kind, at: Date.now() };
    this.hooks.patch(npc.id, { emote: npc.emote });
  }

  private standUp(npc: PlayerState) {
    if (npc.sitting) {
      const free = nearestFree(this.grid, npc.x, npc.y + 1, 3);
      if (free) {
        npc.x = free.x;
        npc.y = free.y;
      }
      npc.sitting = null;
      this.hooks.patch(npc.id, { sitting: null });
    }
  }

  private sitAt(npc: PlayerState, desk: { x: number; y: number }) {
    const s = deskSeat(desk);
    npc.x = s.x + 0.5;
    npc.y = s.y + 0.5;
    npc.dir = 'up';
    npc.moving = false;
    npc.sitting = npc.desk;
    this.hooks.patch(npc.id, { sitting: npc.desk });
  }

  private goHome(npc: PlayerState, r: Runtime, deskById: (id: string) => { x: number; y: number } | null) {
    if (!npc.desk) return this.wander(npc, r);
    const d = deskById(npc.desk);
    if (!d) return this.wander(npc, r);
    const s = deskSeat(d);
    const path = findPath(this.grid, npc, { x: s.x + 0.5, y: s.y + 0.5 });
    if (!path) return this.wander(npc, r);
    r.path = path;
    r.mode = 'walking';
    r.then = 'seated';
  }

  private wander(npc: PlayerState, r: Runtime) {
    this.standUp(npc);
    const spots = this.interestSpots(npc);
    const goal = spots[Math.floor(this.rng() * spots.length)];
    const path = goal && findPath(this.grid, npc, goal);
    if (!path) {
      r.mode = 'lingering';
      r.timer = 6;
      return;
    }
    r.path = path;
    r.mode = 'walking';
    r.then = null;
  }

  /** Places agents like to hang out: café, plaza, courtyard, other labs. */
  private interestSpots(npc: PlayerState): Vec[] {
    const picks = ['cafe', 'plaza', 'lobby', 'courtyard', 'design', 'frontend', 'backend', 'qa'];
    const out: Vec[] = [];
    for (const id of picks) {
      const z = this.map.zones.find((q) => q.id === id);
      if (!z) continue;
      for (let i = 0; i < 3; i++) {
        const p = nearestFree(
          this.grid,
          z.x + 1 + this.rng() * Math.max(1, z.w - 2),
          z.y + 1 + this.rng() * Math.max(1, z.h - 2),
          3,
        );
        if (p && dist(p, npc) > 3) out.push(p);
      }
    }
    return out;
  }

  private standSpotNear(t: Vec): Vec | null {
    const angles = [Math.PI / 2, 0, Math.PI, -Math.PI / 2, Math.PI / 4, (3 * Math.PI) / 4];
    for (const a of angles) {
      const x = t.x + Math.cos(a) * 1.5;
      const y = t.y + Math.sin(a) * 1.5;
      const p = nearestFree(this.grid, x, y, 2);
      if (p) return p;
    }
    return nearestFree(this.grid, t.x, t.y, 4);
  }

  /** Advance along r.path; returns true on arrival. */
  private follow(dt: number, npc: PlayerState, r: Runtime): boolean {
    const next = r.path[0];
    if (!next) {
      npc.moving = false;
      return true;
    }
    const dx = next.x - npc.x;
    const dy = next.y - npc.y;
    const d = Math.hypot(dx, dy);
    const step = NPC_SPEED * dt;
    if (d <= step) {
      npc.x = next.x;
      npc.y = next.y;
      r.path.shift();
      if (r.path.length === 0) {
        npc.moving = false;
        return true;
      }
    } else {
      const m = moveWithCollision(this.grid, npc.x, npc.y, (dx / d) * step, (dy / d) * step);
      if (m.x === npc.x && m.y === npc.y) {
        r.path.shift();
      }
      npc.x = m.x;
      npc.y = m.y;
      npc.dir = dirFromDelta(dx, dy, npc.dir) as Dir;
    }
    npc.moving = true;
    return false;
  }
}
