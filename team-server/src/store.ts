import type { Appearance, AgentSpec, ChatMessage, WorkspaceMap, WorkspaceRole } from './shared/workspace/types.ts';
import type { DesignChatMsg, DesignPin, DesignPrEvent, DesignVersion } from './shared/design/protocol.ts';
import type { Config } from './config.ts';

/** Persisted state of the design room: pinned comments and recent chat. */
export interface DesignDoc {
  pins: DesignPin[];
  chat: DesignChatMsg[];
  /** Latest live deployment and open previews announced by CI (so late joiners see "new version"). */
  live?: DesignVersion | null;
  previews?: DesignVersion[];
  /** Recent pull request events from the GitHub webhook. */
  prs?: DesignPrEvent[];
}

export interface WorkspaceDoc {
  id: string;
  name: string;
  createdAt: number;
}

export interface MemberDoc {
  uid: string;
  role: WorkspaceRole;
  name: string;
  email?: string;
  look: Appearance;
  desk: string | null;
  joinedAt: number;
  lastSeen: number;
}

/** This server holds exactly one project, so there is one office (`wid`) and one design room (`pid`), both `main`. */
export const OFFICE_ID = 'main';

export interface Store {
  getWorkspace(id: string): Promise<WorkspaceDoc | null>;
  putWorkspace(doc: WorkspaceDoc): Promise<void>;
  listMembers(wid: string): Promise<MemberDoc[]>;
  putMember(wid: string, m: MemberDoc): Promise<void>;
  loadMap(wid: string): Promise<WorkspaceMap | null>;
  saveMap(wid: string, map: WorkspaceMap): Promise<void>;
  loadAgents(wid: string): Promise<AgentSpec[] | null>;
  saveAgents(wid: string, agents: AgentSpec[]): Promise<void>;
  recentMessages(wid: string, n: number): Promise<ChatMessage[]>;
  appendMessage(wid: string, msg: ChatMessage): Promise<void>;
  loadDesign(pid: string): Promise<DesignDoc | null>;
  saveDesign(pid: string, doc: DesignDoc): Promise<void>;
  close(): Promise<void>;
}

const clone = <T>(v: T): T => structuredClone(v);

/** Non-persistent store for development and tests. */
export class MemoryStore implements Store {
  private ws = new Map<string, WorkspaceDoc>();
  private members = new Map<string, Map<string, MemberDoc>>();
  private maps = new Map<string, WorkspaceMap>();
  private agents = new Map<string, AgentSpec[]>();
  private msgs = new Map<string, ChatMessage[]>();
  private designs = new Map<string, DesignDoc>();

  async getWorkspace(id: string) {
    const d = this.ws.get(id);
    return d ? clone(d) : null;
  }
  async putWorkspace(doc: WorkspaceDoc) {
    this.ws.set(doc.id, clone(doc));
  }
  async listMembers(wid: string) {
    return [...(this.members.get(wid)?.values() ?? [])].map(clone);
  }
  async putMember(wid: string, m: MemberDoc) {
    let g = this.members.get(wid);
    if (!g) this.members.set(wid, (g = new Map()));
    g.set(m.uid, clone(m));
  }
  async loadMap(wid: string) {
    const m = this.maps.get(wid);
    return m ? clone(m) : null;
  }
  async saveMap(wid: string, map: WorkspaceMap) {
    this.maps.set(wid, clone(map));
  }
  async loadAgents(wid: string) {
    const a = this.agents.get(wid);
    return a ? clone(a) : null;
  }
  async saveAgents(wid: string, agents: AgentSpec[]) {
    this.agents.set(wid, clone(agents));
  }
  async recentMessages(wid: string, n: number) {
    return (this.msgs.get(wid) ?? []).slice(-n).map(clone);
  }
  async appendMessage(wid: string, msg: ChatMessage) {
    const l = this.msgs.get(wid) ?? [];
    l.push(clone(msg));
    if (l.length > 500) l.splice(0, l.length - 500);
    this.msgs.set(wid, l);
  }
  async loadDesign(pid: string) {
    const d = this.designs.get(pid);
    return d ? clone(d) : null;
  }
  async saveDesign(pid: string, doc: DesignDoc) {
    this.designs.set(pid, clone(doc));
  }
  async close() {}
}

const MESSAGE_TTL_MS = 30 * 24 * 3600 * 1000;

/** Cloud Firestore (native mode) persistence, in the owner's own GCP project. */
export class FirestoreStore implements Store {
  private dbPromise: Promise<import('@google-cloud/firestore').Firestore>;

  constructor(projectId: string) {
    this.dbPromise = import('@google-cloud/firestore').then(
      ({ Firestore }) => new Firestore({ projectId: projectId || undefined, ignoreUndefinedProperties: true }),
    );
  }

  private async ws(id: string) {
    return (await this.dbPromise).collection('workspaces').doc(id);
  }

  async getWorkspace(id: string) {
    const s = await (await this.ws(id)).get();
    return s.exists ? (s.data() as WorkspaceDoc) : null;
  }
  async putWorkspace(doc: WorkspaceDoc) {
    await (await this.ws(doc.id)).set(doc);
  }
  async listMembers(wid: string) {
    const q = await (await this.ws(wid)).collection('members').get();
    return q.docs.map((d) => d.data() as MemberDoc);
  }
  async putMember(wid: string, m: MemberDoc) {
    await (await this.ws(wid)).collection('members').doc(m.uid).set(m);
  }
  async loadMap(wid: string) {
    const s = await (await this.ws(wid)).collection('maps').doc('main').get();
    if (!s.exists) return null;
    return JSON.parse((s.data() as { json: string }).json) as WorkspaceMap;
  }
  async saveMap(wid: string, map: WorkspaceMap) {
    // Stored as a JSON string: tile arrays are large and never queried by field.
    await (await this.ws(wid)).collection('maps').doc('main').set({ json: JSON.stringify(map), updatedAt: Date.now() });
  }
  async loadAgents(wid: string) {
    const s = await (await this.ws(wid)).collection('config').doc('agents').get();
    if (!s.exists) return null;
    return JSON.parse((s.data() as { json: string }).json) as AgentSpec[];
  }
  async saveAgents(wid: string, agents: AgentSpec[]) {
    await (await this.ws(wid)).collection('config').doc('agents').set({ json: JSON.stringify(agents), updatedAt: Date.now() });
  }
  async recentMessages(wid: string, n: number) {
    const q = await (await this.ws(wid)).collection('messages').orderBy('at', 'desc').limit(n).get();
    return q.docs.map((d) => d.data() as ChatMessage).reverse();
  }
  async appendMessage(wid: string, msg: ChatMessage) {
    await (await this.ws(wid))
      .collection('messages')
      .doc(msg.id)
      .set({ ...msg, expireAt: new Date(msg.at + MESSAGE_TTL_MS) });
  }
  async loadDesign(pid: string) {
    const s = await (await this.dbPromise).collection('design').doc(pid).get();
    return s.exists ? (JSON.parse((s.data() as { json: string }).json) as DesignDoc) : null;
  }
  async saveDesign(pid: string, doc: DesignDoc) {
    // One document holding pins + chat; both are small (capped) and always loaded together.
    await (await this.dbPromise).collection('design').doc(pid).set({ json: JSON.stringify(doc), updatedAt: Date.now() });
  }
  async close() {
    await (await this.dbPromise).terminate();
  }
}

export function createStore(cfg: Config): Store {
  return cfg.store === 'firestore' ? new FirestoreStore(cfg.firebaseProjectId) : new MemoryStore();
}
