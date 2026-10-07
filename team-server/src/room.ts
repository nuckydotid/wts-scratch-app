import { canHearNearby } from './shared/workspace/chat.ts';
import { zoneAt } from './shared/workspace/default-map.ts';
import { makePlayer } from './shared/workspace/entities.ts';
import {
  PLAYER_SPEED, buildGrid, canStand, dist, nearestFree,
} from './shared/workspace/grid.ts';
import type { Grid } from './shared/workspace/grid.ts';
import { NpcDirector, assignAgentDesks } from './shared/workspace/npc.ts';
import { PROP_DEFS, deskSeat } from './shared/workspace/props.ts';
import { applyEditOp } from './shared/workspace/protocol.ts';
import type { ClientMsg, PosTuple, ServerMsg } from './shared/workspace/protocol.ts';
import type {
  AgentSpec, Appearance, ChatMessage, Dir, PlayerState, WorkspaceMap, WorkspaceRole,
} from './shared/workspace/types.ts';
import type { Config } from './config.ts';
import { log } from './log.ts';
import { TokenBucket } from './ratelimit.ts';
import type { MemberDoc, Store, WorkspaceDoc } from './store.ts';

export interface Transport {
  send(data: string): void;
  close(code?: number, reason?: string): void;
}

export interface Client {
  uid: string;
  role: WorkspaceRole;
  transport: Transport;
  send(msg: ServerMsg): void;
  buckets: { move: TokenBucket; chat: TokenBucket; emote: TokenBucket; edit: TokenBucket; misc: TokenBucket };
  lastMoveAt: number;
}

export interface JoinInfo {
  uid: string;
  name: string;
  look: Appearance;
  email?: string;
  role: WorkspaceRole;
}

const TICK_MS = 100;
const HISTORY = 60;

export class Room {
  readonly players = new Map<string, PlayerState>();
  readonly clients = new Map<string, Client>();
  readonly deskOwners = new Map<string, string>();
  readonly members = new Map<string, MemberDoc>();
  private history: ChatMessage[] = [];
  private director: NpcDirector;
  private grid: Grid;
  private lastSent = new Map<string, string>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private lastTick = Date.now();
  private msgSeq = 0;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  private deskIndex = new Map<string, { x: number; y: number }>();

  constructor(
    readonly doc: WorkspaceDoc,
    public map: WorkspaceMap,
    private agents: AgentSpec[],
    members: MemberDoc[],
    history: ChatMessage[],
    private store: Store,
    readonly cfg: Pick<Config, 'maxPlayers'>,
  ) {
    this.grid = buildGrid(map);
    this.history = history.slice(-HISTORY);
    for (const m of members) {
      this.members.set(m.uid, m);
    }
    this.reindexDesks();
    this.director = new NpcDirector(map, this.grid, {
      patch: (id, patch) => this.broadcast({ t: 'patch', id, patch }),
    });
    this.rebuildDeskOwners();
    this.spawnAgents();
  }

  /* ───────────── lifecycle ───────────── */

  start() {
    if (this.timer) return;
    this.lastTick = Date.now();
    this.timer = setInterval(() => this.tick(), TICK_MS);
  }

  async stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    for (const c of this.clients.values()) {
      c.transport.close(1012, 'server restarting');
    }
    await this.flush();
  }

  async flush() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    await this.store.saveMap(this.doc.id, this.map).catch((e) => log.error('saveMap failed', { err: String(e) }));
  }

  private scheduleSave() {
    if (this.saveTimer) return;
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      void this.store.saveMap(this.doc.id, this.map).catch((e) => log.error('saveMap failed', { err: String(e) }));
    }, 2000);
  }

  private reindexDesks() {
    this.deskIndex.clear();
    for (const p of this.map.props) if (p.kind === 'desk') this.deskIndex.set(p.id, p);
  }

  private rebuildDeskOwners() {
    this.deskOwners.clear();
    for (const m of this.members.values()) {
      if (m.desk && this.deskIndex.has(m.desk) && !this.deskOwners.has(m.desk)) this.deskOwners.set(m.desk, m.uid);
      else if (m.desk) m.desk = null;
    }
  }

  private spawnAgents() {
    for (const [id, p] of [...this.players]) {
      if (p.kind === 'agent') {
        this.director.remove(id);
        this.players.delete(id);
        this.lastSent.delete(id);
        this.broadcast({ t: 'leave', id });
      }
    }
    for (const [desk, owner] of [...this.deskOwners]) if (owner.startsWith('agent:')) this.deskOwners.delete(desk);
    const taken = new Set(this.deskOwners.keys());
    const assigned = assignAgentDesks(this.map, this.agents, taken);
    for (const a of this.agents) {
      const id = `agent:${a.id}`;
      const deskId = assigned[a.id] ?? null;
      const desk = deskId ? this.deskIndex.get(deskId) : null;
      const spot = desk ? deskSeat(desk) : this.map.spawns[0];
      const npc = makePlayer({
        id, name: a.name, kind: 'agent', role: a.role, look: a.look, agentId: a.id,
        x: spot.x + 0.5, y: spot.y + 0.5, desk: deskId,
      });
      if (desk && deskId) {
        npc.sitting = deskId;
        npc.dir = 'up';
        this.deskOwners.set(deskId, id);
        this.broadcast({ t: 'desk.owner', deskId, ownerId: id });
      }
      this.players.set(id, npc);
      this.director.add(npc);
      this.broadcast({ t: 'join', player: npc });
    }
  }

  /* ───────────── connections ───────────── */

  join(client: Client, info: JoinInfo) {
    const existing = this.clients.get(info.uid);
    if (existing) {
      existing.transport.close(4001, 'signed in elsewhere');
      this.leave(existing);
    }
    let m = this.members.get(info.uid);
    const now = Date.now();
    if (!m) {
      m = { uid: info.uid, role: info.role, name: info.name, email: info.email, look: info.look, desk: null, joinedAt: now, lastSeen: now };
      this.members.set(info.uid, m);
    } else {
      m.name = info.name;
      m.look = info.look;
      m.role = info.role; // follows the user's current GitHub permission
      m.lastSeen = now;
      if (info.email) m.email = info.email;
    }
    client.role = m.role;
    void this.store.putMember(this.doc.id, m).catch((e) => log.error('putMember failed', { err: String(e) }));

    const spawn = this.pickSpawn();
    const p = makePlayer({ id: info.uid, name: info.name, kind: 'human', x: spawn.x, y: spawn.y, look: info.look, desk: m.desk });
    if (m.desk && this.deskIndex.has(m.desk)) this.deskOwners.set(m.desk, info.uid);
    else m.desk = null;
    p.desk = m.desk;
    this.players.set(info.uid, p);
    this.clients.set(info.uid, client);

    client.send({
      t: 'welcome',
      you: info.uid,
      role: m.role,
      workspace: { id: this.doc.id, name: this.doc.name },
      map: this.map,
      players: [...this.players.values()],
      deskOwners: Object.fromEntries(this.deskOwners),
      history: this.history,
      serverTime: Date.now(),
    });
    this.broadcast({ t: 'join', player: p }, info.uid);
    if (m.desk) this.broadcast({ t: 'desk.owner', deskId: m.desk, ownerId: info.uid }, info.uid);
    log.info('player joined', { room: this.doc.id, uid: info.uid, online: this.clients.size });
    this.start();
  }

  leave(client: Client) {
    if (this.clients.get(client.uid) !== client) return;
    this.clients.delete(client.uid);
    const p = this.players.get(client.uid);
    this.players.delete(client.uid);
    this.lastSent.delete(client.uid);
    const m = this.members.get(client.uid);
    if (m) {
      m.lastSeen = Date.now();
      void this.store.putMember(this.doc.id, m).catch(() => {});
    }
    if (p) this.broadcast({ t: 'leave', id: p.id });
    log.info('player left', { room: this.doc.id, uid: client.uid, online: this.clients.size });
  }

  private pickSpawn() {
    const spawns = this.map.spawns;
    const taken = [...this.players.values()];
    for (const s of spawns) {
      if (!taken.some((p) => dist(p, s) < 0.8)) return s;
    }
    const s = spawns[Math.floor(Math.random() * spawns.length)] ?? { x: 2.5, y: 2.5 };
    return nearestFree(this.grid, s.x + Math.random() - 0.5, s.y + Math.random() - 0.5, 4) ?? s;
  }

  /* ───────────── tick ───────────── */

  private tick() {
    const now = Date.now();
    const dt = Math.min(0.5, (now - this.lastTick) / 1000);
    this.lastTick = now;
    if (this.clients.size === 0) return;
    const npcs: PlayerState[] = [];
    for (const p of this.players.values()) if (p.kind === 'agent') npcs.push(p);
    this.director.update(dt, npcs, (id) => this.deskIndex.get(id) ?? null);

    const tuples: PosTuple[] = [];
    for (const p of this.players.values()) {
      const key = `${p.x.toFixed(2)}|${p.y.toFixed(2)}|${p.dir}|${p.moving ? 1 : 0}`;
      if (this.lastSent.get(p.id) !== key) {
        this.lastSent.set(p.id, key);
        tuples.push([p.id, +p.x.toFixed(3), +p.y.toFixed(3), p.dir, p.moving ? 1 : 0]);
      }
    }
    if (tuples.length === 0) return;
    for (const c of this.clients.values()) {
      const mine = tuples.filter((t) => t[0] !== c.uid);
      if (mine.length) c.send({ t: 'state', time: now, p: mine });
    }
  }

  private broadcast(msg: ServerMsg, exceptUid?: string) {
    const data = JSON.stringify(msg);
    for (const c of this.clients.values()) {
      if (c.uid === exceptUid) continue;
      c.transport.send(data);
    }
  }

  /* ───────────── message handling ───────────── */

  handle(client: Client, msg: ClientMsg) {
    const p = this.players.get(client.uid);
    if (!p) return;
    switch (msg.t) {
      case 'move':
        if (client.buckets.move.take()) this.onMove(client, p, msg);
        return;
      case 'sit':
        if (client.buckets.misc.take()) this.onSit(client, p, msg.deskId);
        return;
      case 'emote':
        if (!client.buckets.emote.take()) return;
        p.emote = { kind: msg.emote, at: Date.now() };
        this.broadcast({ t: 'patch', id: p.id, patch: { emote: p.emote } }, p.id);
        return;
      case 'status':
        if (!client.buckets.misc.take()) return;
        p.status = msg.status;
        p.statusText = msg.text ?? '';
        this.broadcast({ t: 'patch', id: p.id, patch: { status: p.status, statusText: p.statusText } }, p.id);
        return;
      case 'activity':
        if (!client.buckets.misc.take()) return;
        p.activity = msg.activity;
        this.broadcast({ t: 'patch', id: p.id, patch: { activity: p.activity } }, p.id);
        return;
      case 'chat':
        if (client.buckets.chat.take()) this.onChat(client, p, msg);
        return;
      case 'agent.chat':
        this.onAgentChat(client, msg);
        return;
      case 'desk.claim':
        if (client.buckets.misc.take()) this.onClaim(client, p, msg.deskId);
        return;
      case 'edit':
        if (client.buckets.edit.take()) this.onEdit(client, p, msg.op);
        return;
      case 'agents.sync':
        if (client.role === 'owner' || client.role === 'admin') this.onAgentsSync(msg.agents);
        else client.send({ t: 'error', code: 'forbidden', message: 'Only admins can sync agents.' });
        return;
      case 'ping':
        client.send({ t: 'pong', at: msg.at, serverTime: Date.now() });
        return;
      case 'hello':
        return;
    }
  }

  private onMove(client: Client, p: PlayerState, m: { x: number; y: number; dir: Dir; moving: boolean }) {
    const now = Date.now();
    const dt = Math.max(0.02, Math.min(1, (now - client.lastMoveAt) / 1000));
    client.lastMoveAt = now;
    if (p.sitting && !m.moving && dist(p, m) < 0.05) return;
    const maxStep = PLAYER_SPEED * dt * 1.6 + 0.4;
    if (dist(p, m) > maxStep || !canStand(this.grid, m.x, m.y)) {
      client.send({ t: 'correct', x: p.x, y: p.y });
      return;
    }
    if (p.sitting) {
      p.sitting = null;
      this.broadcast({ t: 'patch', id: p.id, patch: { sitting: null } }, p.id);
    }
    p.x = m.x;
    p.y = m.y;
    p.dir = m.dir;
    p.moving = m.moving;
  }

  private onSit(client: Client, p: PlayerState, deskId: string | null) {
    if (deskId === null) {
      if (!p.sitting) return;
      const free = nearestFree(this.grid, p.x, p.y + 1, 3);
      p.sitting = null;
      if (free) {
        p.x = free.x;
        p.y = free.y;
      }
      this.broadcast({ t: 'patch', id: p.id, patch: { sitting: null } }, p.id);
      client.send({ t: 'correct', x: p.x, y: p.y });
      return;
    }
    const desk = this.deskIndex.get(deskId);
    if (!desk) return;
    const owner = this.deskOwners.get(deskId);
    if (owner && owner !== p.id) {
      client.send({ t: 'error', code: 'desk_taken', message: 'That desk belongs to someone else.' });
      return;
    }
    const seat = deskSeat(desk);
    const sx = seat.x + 0.5;
    const sy = seat.y + 0.5;
    if (dist(p, { x: sx, y: sy }) > 3) {
      client.send({ t: 'correct', x: p.x, y: p.y });
      return;
    }
    p.x = sx;
    p.y = sy;
    p.dir = 'up';
    p.moving = false;
    p.sitting = deskId;
    this.broadcast({ t: 'patch', id: p.id, patch: { sitting: deskId } }, p.id);
  }

  private onChat(client: Client, p: PlayerState, m: Extract<ClientMsg, { t: 'chat' }>) {
    const msg: ChatMessage = {
      id: `${p.id}-${Date.now().toString(36)}-${(this.msgSeq++).toString(36)}`,
      scope: m.scope,
      from: p.id,
      fromName: p.name,
      to: m.to,
      text: m.text,
      at: Date.now(),
      zone: zoneAt(this.map, p.x, p.y)?.name,
    };
    if (m.scope === 'room') {
      this.history.push(msg);
      if (this.history.length > HISTORY) this.history.shift();
      void this.store.appendMessage(this.doc.id, msg).catch(() => {});
      this.broadcast({ t: 'chat', msg });
    } else if (m.scope === 'nearby') {
      for (const c of this.clients.values()) {
        const l = this.players.get(c.uid);
        if (l && (c.uid === p.id || canHearNearby(this.map, p, l))) c.send({ t: 'chat', msg });
      }
    } else {
      const target = m.to ? this.clients.get(m.to) : undefined;
      if (!target) {
        client.send({ t: 'error', code: 'no_recipient', message: 'That person is not online.' });
        return;
      }
      client.send({ t: 'chat', msg });
      if (target !== client) target.send({ t: 'chat', msg });
    }
  }

  private onClaim(client: Client, p: PlayerState, deskId: string | null) {
    const m = this.members.get(p.id);
    if (!m) return;
    const release = (id: string) => {
      this.deskOwners.delete(id);
      this.broadcast({ t: 'desk.owner', deskId: id, ownerId: null });
    };
    if (deskId !== null) {
      if (!this.deskIndex.has(deskId)) return;
      const owner = this.deskOwners.get(deskId);
      if (owner && owner !== p.id) {
        client.send({ t: 'error', code: 'desk_taken', message: 'That desk is already claimed.' });
        return;
      }
    }
    if (m.desk && m.desk !== deskId) release(m.desk);
    m.desk = deskId;
    p.desk = deskId;
    if (deskId) {
      this.deskOwners.set(deskId, p.id);
      this.broadcast({ t: 'desk.owner', deskId, ownerId: p.id });
    }
    this.broadcast({ t: 'patch', id: p.id, patch: { desk: deskId } }, p.id);
    void this.store.putMember(this.doc.id, m).catch(() => {});
  }

  private onEdit(client: Client, p: PlayerState, op: import('./shared/workspace/types.ts').EditOp) {
    if (client.role !== 'owner' && client.role !== 'admin') {
      client.send({ t: 'error', code: 'forbidden', message: 'Only admins can edit the office.' });
      return;
    }
    if (op.op === 'prop.add') {
      const def = PROP_DEFS[op.prop.kind];
      const { x, y } = op.prop;
      if (x < 0 || y < 0 || x + def.w > this.map.width || y + def.h > this.map.height) return;
    }
    if (op.op === 'zone.set' && this.map.zones.length > 64 && !this.map.zones.some((z) => z.id === op.zone.id)) return;
    if (op.op === 'prop.add' && this.map.props.length > 1500) return;
    if (!applyEditOp(this.map, op)) return;
    this.grid = buildGrid(this.map);
    this.director.setMap(this.map, this.grid);
    this.reindexDesks();
    // desks that vanished lose their owners
    for (const [desk, owner] of [...this.deskOwners]) {
      if (this.deskIndex.has(desk)) continue;
      this.deskOwners.delete(desk);
      const m = this.members.get(owner);
      if (m) m.desk = null;
      const pl = this.players.get(owner);
      if (pl) {
        pl.desk = null;
        if (pl.sitting === desk) pl.sitting = null;
      }
      this.broadcast({ t: 'desk.owner', deskId: desk, ownerId: null });
    }
    // anyone left standing inside a new wall/prop is nudged out
    for (const pl of this.players.values()) {
      if (pl.sitting) continue;
      if (!canStand(this.grid, pl.x, pl.y)) {
        const f = nearestFree(this.grid, pl.x, pl.y, 6);
        if (f) {
          pl.x = f.x;
          pl.y = f.y;
          this.clients.get(pl.id)?.send({ t: 'correct', x: f.x, y: f.y });
        }
      }
    }
    this.broadcast({ t: 'map.edit', op, by: p.id });
    this.scheduleSave();
  }

  private onAgentsSync(agents: AgentSpec[]) {
    this.agents = agents.length ? agents : this.agents;
    void this.store.saveAgents(this.doc.id, this.agents).catch(() => {});
    this.spawnAgents();
  }

  /* ───────────── agents ───────────── */

  /** Office teammates are decoration in this version: they sit at desks and wander, but do not talk. */
  private onAgentChat(client: Client, m: Extract<ClientMsg, { t: 'agent.chat' }>) {
    client.send({ t: 'agent.error', reqId: m.reqId, agentId: m.agentId, message: 'Office teammates cannot chat yet. Run an agent on a card from the board instead.' });
  }
}
