import type { ChatFrame } from "backend/chat-client";

export interface Msg {
  id: number;
  room: string;
  from: string;
  body: string;
  at: string;
}

export interface Room {
  id: string;
  name: string;
  closed: boolean;
  unread: number;
  last: Msg | null;
}

export interface ChatData {
  rooms: Record<string, Room>;
  /** Messages per room, oldest first. */
  messages: Record<string, Msg[]>;
  /** The room currently on screen (incoming messages there are read immediately). */
  active: string | null;
}

export const emptyChat = (): ChatData => ({ rooms: {}, messages: {}, active: null });

/** Merge pages/frames into one ascending list without duplicates. */
export function mergeMessages(existing: Msg[], incoming: Msg[]): Msg[] {
  const byId = new Map<number, Msg>();
  for (const m of existing) byId.set(m.id, m);
  for (const m of incoming) byId.set(m.id, m);
  return [...byId.values()].sort((a, b) => a.id - b.id);
}

export function setRooms(state: ChatData, rooms: Room[]): ChatData {
  return { ...state, rooms: Object.fromEntries(rooms.map((r) => [r.id, r])) };
}

/** Rooms newest-activity first (rooms without messages last, by name). */
export function sortedRooms(state: ChatData): Room[] {
  return Object.values(state.rooms).sort((a, b) => (b.last?.id ?? 0) - (a.last?.id ?? 0) || a.name.localeCompare(b.name));
}

/** Apply one server frame. `self` is the signed-in uid. Unknown rooms are left for the next `loadRooms`. */
export function applyFrame(state: ChatData, f: ChatFrame, self: string): ChatData {
  if (f.t === "message") {
    const m = f.message;
    const room = state.rooms[m.room];
    const loaded = state.messages[m.room];
    const isActive = state.active === m.room;
    const fromOther = m.from !== self;
    return {
      ...state,
      messages: loaded ? { ...state.messages, [m.room]: mergeMessages(loaded, [m]) } : state.messages,
      rooms: room
        ? {
            ...state.rooms,
            [m.room]: { ...room, last: !room.last || m.id > room.last.id ? m : room.last, unread: fromOther && !isActive ? room.unread + 1 : room.unread },
          }
        : state.rooms,
    };
  }
  if (f.t === "read" && f.uid === self) {
    const room = state.rooms[f.room];
    return room ? { ...state, rooms: { ...state.rooms, [f.room]: { ...room, unread: 0 } } } : state;
  }
  return state;
}

/** `14:05` for today, otherwise `6 Oct`. */
export function formatTime(iso: string, now = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
    : `${d.getDate()} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()]}`;
}
