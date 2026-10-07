import { hc } from "hono/client";
import type { AppType } from "./app.ts";

/** Typed API client for the Expo app: `const api = createClient(url, () => idToken)`. */
export const createClient = (baseUrl: string, getToken: () => Promise<string | null> | string | null) =>
  hc<AppType>(baseUrl, {
    headers: async () => {
      const t = await getToken();
      return t ? { authorization: `Bearer ${t}` } : ({} as Record<string, string>);
    },
  });
export type { AppType };
