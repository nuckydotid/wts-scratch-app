# Hono RPC: Monorepo Architecture & Best Practices

---

## 1. Always Chain Routers for Type Inference

When defining routes, chaining methods (`.get().post()`) preserves TypeScript's return type metadata across the router:

```ts
// ✅ Good: Chained methods preserve full route signature
export const router = new Hono()
  .get("/items", (c) => c.json([]))
  .post("/items", (c) => c.json({ created: true }));

// ❌ Bad: Separate statements break method chaining type inference
const router = new Hono();
router.get("/items", (c) => c.json([]));
router.post("/items", (c) => c.json({ created: true }));
```

---

## 2. Share `AppType` across Bun / Turborepo Workspaces

In your root monorepo or `apps/app/package.json`:

```json
{
  "dependencies": {
    "hono": "^4.7.0",
    "@repo/api": "workspace:*"
  }
}
```

Import types directly:

```ts
import type { AppType } from "@repo/api";
```
