# Hono RPC: Type-Safe Client (`hc`)

Hono RPC provides end-to-end type safety between your Google Cloud Workers backend and React Native / Web frontends **without any code generation**.

---

## 1. Backend: Defining & Exporting API Types

To enable RPC type inference, chain your route definitions and export the app type:

```ts
// api/src/routes/users.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["teacher", "parent"]),
});

export const usersRouter = new Hono()
  .get("/", (c) => {
    return c.json({ users: [{ id: "1", name: "Nicky" }] });
  })
  .get("/:id", (c) => {
    const id = c.req.param("id");
    return c.json({ id, name: "Nicky", role: "teacher" as const });
  })
  .post("/", zValidator("json", createUserSchema), async (c) => {
    const body = c.req.valid("json");
    return c.json({ id: "2", ...body }, 201);
  });

// api/src/index.ts
import { Hono } from "hono";
import { usersRouter } from "./routes/users";

const app = new Hono();
const routes = app.route("/api/users", usersRouter);

// Export AppType for client consumption:
export type AppType = typeof routes;
export default app;
```

---

## 2. Frontend / Client: Making Type-Safe RPC Calls

Import `hc` and `AppType` in your React / React Native app:

```ts
// app/src/lib/api-client.ts
import { hc } from "hono/client";
import type { AppType } from "@backend/api";

export const client = hc<AppType>("https://api.example.com");
```

### Making Requests with Full Autocomplete & Inferred Return Types

```ts
// GET /api/users
const res = await client.api.users.$get();
if (res.ok) {
  const data = await res.json(); // Type: { users: { id: string; name: string }[] }
  console.log(data.users);
}

// GET /api/users/:id
const userRes = await client.api.users[":id"].$get({
  param: { id: "123" },
});
const user = await userRes.json(); // Type: { id: string; name: string; role: 'teacher' }

// POST /api/users (with Zod validation type checking on request body!)
const createRes = await client.api.users.$post({
  json: {
    name: "Sarah",
    email: "sarah@example.com",
    role: "parent",
  },
});
const createdUser = await createRes.json(); // Type: { id: string; name: string; email: string; role: 'teacher' | 'parent' }
```

---

## 3. Integrating with TanStack React Query

```ts
import { useQuery, useMutation } from "@tanstack/react-query";
import { client } from "./api-client";

export function useUser(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const res = await client.api.users[":id"].$get({ param: { id } });
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });
}
```
