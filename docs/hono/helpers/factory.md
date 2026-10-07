# Hono Helper: `createFactory` & `createMiddleware`

`createFactory` provides a clean way to define typed middlewares, handlers, and router factories with shared `Env` types across multiple files.

---

## 1. Syntax

```ts
// src/factory.ts
import { createFactory } from "hono/factory";

export type AppEnv = {
  Bindings: {
    DB: D1Database;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
    role: string;
  };
};

export const factory = createFactory<AppEnv>();
```

---

## 2. Creating Typed Middleware & Handlers

```ts
// src/middlewares/auth.ts
import { factory } from "../factory";

export const authMiddleware = factory.createMiddleware(async (c, next) => {
  const token = c.req.header("Authorization");
  if (!token) return c.text("Unauthorized", 401);
  c.set("userId", "user_123");
  c.set("role", "teacher");
  await next();
});

// src/handlers/profile.ts
export const getProfileHandler = factory.createHandlers(
  authMiddleware,
  async (c) => {
    const userId = c.get("userId"); // Strongly typed as string!
    return c.json({ id: userId });
  },
);
```
