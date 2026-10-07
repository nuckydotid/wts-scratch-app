# Hono Core: Routing

Hono provides an intuitive, highly optimized routing engine (SmartRouter / RegExpRouter) capable of handling millions of requests per second with microsecond overhead.

---

## 1. HTTP Methods

```ts
import { Hono } from "hono";

const app = new Hono();

app.get("/users", (c) => c.json({ users: [] }));
app.post("/users", (c) => c.json({ message: "User created" }, 201));
app.put("/users/:id", (c) => c.json({ updated: c.req.param("id") }));
app.patch("/users/:id", (c) => c.json({ patched: c.req.param("id") }));
app.delete("/users/:id", (c) => c.json({ deleted: c.req.param("id") }));
app.all("/webhook", (c) => c.text("Handles all HTTP verbs"));
```

---

## 2. Route Parameters & Wildcards

### Named Parameters

```ts
// Matches /posts/123
app.get("/posts/:id", (c) => {
  const id = c.req.param("id");
  return c.text(`Post ID: ${id}`);
});

// Multiple parameters
app.get("/users/:userId/posts/:postId", (c) => {
  const { userId, postId } = c.req.param();
  return c.json({ userId, postId });
});
```

### Regular Expressions in Route Parameters

```ts
// Matches only numeric IDs: /items/123 (not /items/abc)
app.get("/items/:id{[0-9]+}", (c) => {
  return c.text(`Item number ${c.req.param("id")}`);
});
```

### Optional Parameters & Wildcards

```ts
// Optional segment: matches /api/animal or /api/animal/dog
app.get("/api/animal/:type?", (c) => {
  return c.text(c.req.param("type") ?? "default-animal");
});

// Wildcard: matches /static/css/main.css, /static/images/logo.png
app.get("/static/*", (c) => {
  const path = c.req.path;
  return c.text(`Serving static asset: ${path}`);
});
```

---

## 3. Sub-routing & Modular Route Groups (`app.route()`)

Modularize large APIs by splitting routes across files and mounting them onto parent routers:

```ts
// src/routes/posts.ts
import { Hono } from "hono";

export const postRouter = new Hono()
  .get("/", (c) => c.json([{ id: "1", title: "First Post" }]))
  .get("/:id", (c) => c.json({ id: c.req.param("id") }));

// src/index.ts
import { Hono } from "hono";
import { postRouter } from "./routes/posts";

const app = new Hono();

// Mounts postRouter under /api/posts
const apiRoutes = app.route("/api/posts", postRouter);

// Export chained type for Hono RPC:
export type AppType = typeof apiRoutes;
export default app;
```
