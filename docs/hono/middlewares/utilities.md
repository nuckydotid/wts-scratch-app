# Hono Middleware: Logging, Timing, Cache & Utilities

---

## 1. `logger` & `timing`

```ts
import { logger } from "hono/logger";
import { timing, setMetric } from "hono/timing";

app.use("*", logger());
app.use("*", timing());

app.get("/expensive-task", async (c) => {
  setMetric(c, "db-query", 42, "Database Query Time");
  return c.text("Completed");
});
```

---

## 2. `cache` (Edge Caching with Cache API)

```ts
import { cache } from "hono/cache";

app.get(
  "/static-feed",
  cache({
    cacheName: "feed-cache-v1",
    cacheControl: "max-age=600", // 10 minutes edge cache
  }),
  async (c) => {
    return c.json({ feed: [] });
  },
);
```

---

## 3. `prettyJSON`, `compress`, `requestId`, `timeout`

```ts
import { prettyJSON } from "hono/pretty-json";
import { compress } from "hono/compress";
import { requestId } from "hono/request-id";
import { timeout } from "hono/timeout";

app.use("*", requestId());
app.use("*", compress());
app.use("*", prettyJSON({ space: 2 }));
app.use("/api/*", timeout(10000)); // 10s execution timeout
```
