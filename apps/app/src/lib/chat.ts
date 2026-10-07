import { ChatClient } from "backend/chat-client";
import type { ChatStatus } from "backend/chat-client";
import { create } from "zustand";
import { api } from "./api";
import { getIdToken, useAuth } from "./auth";
import { applyFrame, emptyChat, mergeMessages, setRooms } from "./chat-state";
import type { ChatData, Msg, Room } from "./chat-state";
import { chatSocketUrl } from "./config";

interface ChatStore extends ChatData {
  status: ChatStatus;
  error: string | null;
  /** Next `before` cursor per room (null = everything loaded). */
  older: Record<string, number | null>;
  connect: () => void;
  disconnect: () => void;
  loadRooms: () => Promise<void>;
  openRoom: (id: string) => Promise<void>;
  closeRoom: () => void;
  loadOlder: (id: string) => Promise<void>;
  send: (room: string, body: string) => Promise<void>;
  createRoom: (name: string, members: string[]) => Promise<string>;
}

let client: ChatClient | null = null;
let unsubs: (() => void)[] = [];
const self = () => useAuth.getState().user?.uid ?? "";
const ascending = (m: { id: number; room: string; from: string; body: string; at: string }[]): Msg[] => [...m].reverse();

export const useChat = create<ChatStore>((set, get) => ({
  ...emptyChat(),
  status: "idle",
  error: null,
  older: {},

  connect: () => {
    if (client) return;
    const c = new ChatClient({ url: chatSocketUrl(), getToken: getIdToken });
    client = c;
    unsubs = [
      c.subscribe(() => {
        const s = c.getSnapshot();
        set({ status: s.status, error: s.error });
      }),
      c.onFrame((f) => {
        if (f.t === "ready") {
          // (Re)connected: catch up on anything missed while offline.
          void get().loadRooms();
          const active = get().active;
          if (active) void get().openRoom(active);
        } else if (f.t === "room") {
          void get().loadRooms();
        } else {
          set(applyFrame(get(), f, self()));
        }
      }),
    ];
    c.connect();
  },

  disconnect: () => {
    unsubs.forEach((u) => u());
    unsubs = [];
    client?.close();
    client = null;
    set({ ...emptyChat(), status: "idle", error: null, older: {} });
  },

  loadRooms: async () => {
    const res = await api.api.v1.chat.rooms.$get();
    if (!res.ok) return set({ error: `Could not load chats (${res.status})` });
    const { rooms } = (await res.json()) as { rooms: Room[] };
    set((s) => setRooms(s, rooms));
  },

  openRoom: async (id) => {
    set({ active: id });
    set((s) => ({ rooms: s.rooms[id] ? { ...s.rooms, [id]: { ...s.rooms[id], unread: 0 } } : s.rooms }));
    const res = await api.api.v1.chat.rooms[":id"].messages.$get({ param: { id }, query: {} });
    if (!res.ok) return set({ error: `Could not load messages (${res.status})` });
    const { messages, nextBefore } = (await res.json()) as { messages: Msg[]; nextBefore: number | null };
    set((s) => ({ messages: { ...s.messages, [id]: mergeMessages(s.messages[id] ?? [], ascending(messages)) }, older: { ...s.older, [id]: nextBefore } }));
    const last = get().messages[id]?.at(-1);
    if (last) client?.markRead(id, last.id);
  },

  closeRoom: () => set({ active: null }),

  loadOlder: async (id) => {
    const before = get().older[id];
    if (!before) return;
    const res = await api.api.v1.chat.rooms[":id"].messages.$get({ param: { id }, query: { before: String(before) } });
    if (!res.ok) return;
    const { messages, nextBefore } = (await res.json()) as { messages: Msg[]; nextBefore: number | null };
    set((s) => ({ messages: { ...s.messages, [id]: mergeMessages(s.messages[id] ?? [], ascending(messages)) }, older: { ...s.older, [id]: nextBefore } }));
  },

  send: async (room, body) => {
    try {
      if (client && get().status === "online") {
        await client.send(room, body); // the message arrives back as a broadcast frame
        return;
      }
    } catch {
      /* fall through to REST */
    }
    const res = await api.api.v1.chat.rooms[":id"].messages.$post({ param: { id: room }, json: { body } });
    if (!res.ok) throw new Error(`send failed (${res.status})`);
    const { message } = (await res.json()) as { message: Msg };
    set((s) => ({ messages: { ...s.messages, [room]: mergeMessages(s.messages[room] ?? [], [message]) } }));
  },

  createRoom: async (name, members) => {
    const res = await api.api.v1.chat.rooms.$post({ json: { name, members } });
    if (!res.ok) throw new Error(`could not create the chat (${res.status})`);
    const { id } = (await res.json()) as { id: string };
    await get().loadRooms();
    return id;
  },
}));
