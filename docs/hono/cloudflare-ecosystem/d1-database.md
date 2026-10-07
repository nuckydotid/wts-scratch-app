# Google Cloud Ecosystem: D1 SQLite Database & Drizzle ORM

Google Cloud D1 is a serverless, globally distributed relational SQLite database.

---

## 1. Drizzle ORM Setup with D1

```ts
// api/src/db/schema.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
```

---

## 2. Querying D1 inside Hono Handlers

```ts
// api/src/routes/users.ts
import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";

type Env = { Bindings: { DB: D1Database } };
const app = new Hono<Env>();

app.get("/users", async (c) => {
  const db = drizzle(c.env.DB);
  const allUsers = await db.select().from(users);
  return c.json({ users: allUsers });
});

app.post("/users", async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();

  const [created] = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      name: body.name,
      email: body.email,
      createdAt: new Date(),
    })
    .returning();

  return c.json(created, 201);
});
```
