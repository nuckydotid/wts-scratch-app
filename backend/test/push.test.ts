import { describe, expect, test } from "bun:test";
import { OneSignalNotifier } from "../src/push.ts";

describe("OneSignalNotifier", () => {
  test("addresses recipients by external_id with the REST key, de-duplicated", async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const fake = (async (url: string, init: RequestInit) => (calls.push({ url, init }), new Response("{}", { status: 200 }))) as unknown as typeof fetch;
    const n = new OneSignalNotifier("app-1", "key-1", fake);
    expect(await n.send(["a", "b", "a"], "Title", "Body", { room: "r1" })).toEqual({ sent: 2, failed: 0 });
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe("https://api.onesignal.com/notifications");
    expect((calls[0].init.headers as Record<string, string>).authorization).toBe("Key key-1");
    expect(JSON.parse(String(calls[0].init.body))).toMatchObject({
      app_id: "app-1",
      target_channel: "push",
      include_aliases: { external_id: ["a", "b"] },
      headings: { en: "Title" },
      contents: { en: "Body" },
      data: { room: "r1" },
    });
  });

  test("batches at 2000 recipients and counts failures per batch", async () => {
    let n = 0;
    const fake = (async () => new Response("{}", { status: n++ === 0 ? 200 : 500 })) as unknown as typeof fetch;
    const uids = Array.from({ length: 2500 }, (_, i) => `u${i}`);
    expect(await new OneSignalNotifier("a", "k", fake).send(uids, "t", "b")).toEqual({ sent: 2000, failed: 500 });
  });

  test("a network error is a failure, not a throw", async () => {
    const fake = (async () => {
      throw new Error("offline");
    }) as unknown as typeof fetch;
    expect(await new OneSignalNotifier("a", "k", fake).send(["x"], "t", "b")).toEqual({ sent: 0, failed: 1 });
  });
});
