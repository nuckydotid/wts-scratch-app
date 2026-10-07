import { applyFrame, emptyChat, formatTime, mergeMessages, setRooms, sortedRooms } from "../chat-state";
import type { ChatData, Msg } from "../chat-state";

const msg = (id: number, from = "bob", room = "r1"): Msg => ({ id, room, from, body: `m${id}`, at: "2026-10-06T08:05:00.000Z" });
const base = (): ChatData =>
  setRooms(emptyChat(), [
    { id: "r1", name: "Garden", closed: false, unread: 0, last: null },
    { id: "r2", name: "Zebra", closed: false, unread: 0, last: msg(9, "bob", "r2") },
  ]);

describe("chat state", () => {
  it("merges pages without duplicates, oldest first", () => {
    expect(mergeMessages([msg(3), msg(4)], [msg(1), msg(2), msg(3)]).map((m) => m.id)).toEqual([1, 2, 3, 4]);
  });

  it("counts unread for messages from others when the room is not on screen", () => {
    const s = applyFrame(base(), { t: "message", message: msg(10) }, "ann");
    expect(s.rooms.r1.unread).toBe(1);
    expect(s.rooms.r1.last?.id).toBe(10);
  });

  it("does not count own messages or messages in the active room", () => {
    expect(applyFrame(base(), { t: "message", message: msg(10, "ann") }, "ann").rooms.r1.unread).toBe(0);
    const active = { ...base(), active: "r1" };
    expect(applyFrame(active, { t: "message", message: msg(10) }, "ann").rooms.r1.unread).toBe(0);
  });

  it("appends to a loaded conversation only, and ignores a duplicate delivery", () => {
    const loaded: ChatData = { ...base(), messages: { r1: [msg(1)] } };
    const once = applyFrame(loaded, { t: "message", message: msg(2) }, "ann");
    expect(once.messages.r1.map((m) => m.id)).toEqual([1, 2]);
    expect(applyFrame(once, { t: "message", message: msg(2) }, "ann").messages.r1).toHaveLength(2);
    expect(applyFrame(base(), { t: "message", message: msg(2) }, "ann").messages.r1).toBeUndefined();
  });

  it("clears unread when I read on another device, ignores others' read receipts", () => {
    const unread = applyFrame(base(), { t: "message", message: msg(10) }, "ann");
    expect(applyFrame(unread, { t: "read", room: "r1", uid: "bob", upTo: 10 }, "ann").rooms.r1.unread).toBe(1);
    expect(applyFrame(unread, { t: "read", room: "r1", uid: "ann", upTo: 10 }, "ann").rooms.r1.unread).toBe(0);
  });

  it("an old message does not move `last` backwards", () => {
    const s = applyFrame(applyFrame(base(), { t: "message", message: msg(12) }, "ann"), { t: "message", message: msg(11) }, "ann");
    expect(s.rooms.r1.last?.id).toBe(12);
  });

  it("orders rooms by latest activity, then name", () => {
    const s = applyFrame(base(), { t: "message", message: msg(20) }, "ann");
    expect(sortedRooms(s).map((r) => r.id)).toEqual(["r1", "r2"]);
  });

  it("formats today as a clock time and other days as a date", () => {
    const now = new Date(2026, 9, 6, 20, 0);
    expect(formatTime(new Date(2026, 9, 6, 8, 5).toISOString(), now)).toBe("08:05");
    expect(formatTime(new Date(2026, 8, 30, 8, 5).toISOString(), now)).toBe("30 Sep");
    expect(formatTime("nope", now)).toBe("");
  });
});
