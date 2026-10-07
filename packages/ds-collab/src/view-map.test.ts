import { describe, expect, test } from "bun:test";
import { fromDesignView, pathToStory, sameSha, sameView, storyToHref, toDesignView } from "./view-map.ts";

describe("view mapping", () => {
  const vp = { w: 1000, h: 500 };

  test("scroll travels as a fraction of the viewport and round-trips on the same window", () => {
    const v = toDesignView("flows/signup", { scale: 0.5, tx: -250, ty: 100 }, vp);
    expect(v).toEqual({ story: "flows/signup", zoom: 0.5, sx: -0.25, sy: 0.2 });
    expect(fromDesignView(v, vp)).toEqual({ scale: 0.5, tx: -250, ty: 100 });
  });

  test("a follower with a different window lands on the same relative position", () => {
    const v = toDesignView("flows/signup", { scale: 1, tx: -250, ty: 100 }, vp);
    expect(fromDesignView(v, { w: 2000, h: 1000 })).toEqual({ scale: 1, tx: -500, ty: 200 });
  });

  test("zoom is clamped to what the canvas supports; a zero-size viewport never divides by zero", () => {
    expect(fromDesignView({ story: "flows/a", zoom: 16, sx: 0, sy: 0 }, vp).scale).toBe(2);
    expect(fromDesignView({ story: "flows/a", zoom: 0.05, sx: 0, sy: 0 }, vp).scale).toBe(0.1);
    expect(toDesignView("flows/a", { scale: 1, tx: 10, ty: 10 }, { w: 0, h: 0 })).toEqual({ story: "flows/a", zoom: 1, sx: 10, sy: 10 });
  });

  test("story ids map to routes and back; anything else is refused", () => {
    expect(storyToHref("blocks/block-chat-bubble")).toBe("/expo-story/blocks/block-chat-bubble");
    expect(storyToHref("flows/signup")).toBe("/expo-story/flows/signup");
    expect(storyToHref("../../etc")).toBeNull();
    expect(storyToHref("blocks/a/b")).toBeNull();
    expect(storyToHref("other/x")).toBeNull();
    expect(pathToStory("/expo-story/blocks/block-chat-bubble")).toBe("blocks/block-chat-bubble");
    expect(pathToStory("/expo-story/flows/signup/")).toBe("flows/signup");
    expect(pathToStory("/elsewhere")).toBeNull();
  });

  test("sameView ignores tiny jitter (no feedback loop while following)", () => {
    const a = { story: "flows/a", zoom: 1, sx: 0.1, sy: 0.1 };
    expect(sameView(a, { ...a, sx: 0.1005 })).toBe(true);
    expect(sameView(a, { ...a, sx: 0.2 })).toBe(false);
    expect(sameView(a, { ...a, story: "flows/b" })).toBe(false);
  });

  test("commit ids compare by prefix, never when too short", () => {
    expect(sameSha("a1b2c3d", "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678")).toBe(true);
    expect(sameSha("A1B2C3D", "a1b2c3d")).toBe(true);
    expect(sameSha("a1b2c3d", "deadbee")).toBe(false);
    expect(sameSha("a1", "a1b2c3d")).toBe(false);
  });
});
