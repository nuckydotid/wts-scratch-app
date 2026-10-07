import { buildDefaultMap } from './shared/workspace/default-map.ts';
import { DEFAULT_AGENTS } from './shared/workspace/looks.ts';
import type { WorkspaceRole } from './shared/workspace/types.ts';
import type { Config } from './config.ts';
import { AuthzError } from './membership.ts';
import type { TeamMember } from './membership.ts';
import { Room } from './room.ts';
import { DesignRoom } from './design-room.ts';
import { OFFICE_ID } from './store.ts';
import type { Store } from './store.ts';

/** Owners (repo admins) and PMs can edit the office; everyone else is a member. */
export const workspaceRole = (m: TeamMember): WorkspaceRole => (m.role === 'founder' ? 'owner' : m.role === 'pm' ? 'admin' : 'member');

/** The project's one virtual office, loaded on first use. Who may enter is decided by `Membership` before this. */
export class Office {
  private room: Promise<Room> | null = null;
  private loaded: Room | null = null;

  constructor(
    private store: Store,
    private cfg: Pick<Config, 'repo' | 'maxPlayers'>,
  ) {}

  async enter(uid: string, member: TeamMember): Promise<{ room: Room; role: WorkspaceRole }> {
    const room = await this.load();
    if (!room.clients.has(uid) && room.clients.size >= this.cfg.maxPlayers) throw new AuthzError('room_full', 'This office is full.');
    return { room, role: workspaceRole(member) };
  }

  private load(): Promise<Room> {
    this.room ??= this.create().catch((e) => {
      this.room = null;
      throw e;
    });
    return this.room;
  }

  private async create(): Promise<Room> {
    let doc = await this.store.getWorkspace(OFFICE_ID);
    if (!doc) {
      doc = { id: OFFICE_ID, name: this.cfg.repo.split('/')[1] || 'Team office', createdAt: Date.now() };
      await this.store.putWorkspace(doc);
    }
    const [map, agents, members, history] = await Promise.all([
      this.store.loadMap(OFFICE_ID),
      this.store.loadAgents(OFFICE_ID),
      this.store.listMembers(OFFICE_ID),
      this.store.recentMessages(OFFICE_ID, 50),
    ]);
    return (this.loaded = new Room(doc, map ?? buildDefaultMap(), agents ?? DEFAULT_AGENTS, members, history, this.store, this.cfg));
  }

  async shutdown() {
    if (this.room) await (await this.room.catch(() => null))?.stop();
  }

  stats() {
    return { online: this.loaded?.clients.size ?? 0 };
  }
}

/** The project's one design room. */
export class Design {
  private room: Promise<DesignRoom> | null = null;

  constructor(private store: Store) {}

  /** The room, loading it from the store on first use (also used by the webhooks). */
  get(): Promise<DesignRoom> {
    this.room ??= this.store.loadDesign(OFFICE_ID).then((doc) => new DesignRoom(OFFICE_ID, doc, this.store));
    this.room.catch(() => (this.room = null));
    return this.room;
  }

  async shutdown() {
    if (this.room) await (await this.room.catch(() => null))?.stop();
  }
}
