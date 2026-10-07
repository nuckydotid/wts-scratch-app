# Drizzle Kit: Migrations & Google Cloud D1

Generate and apply SQL migrations to Google Cloud D1 databases.

---

## 1. Migration Generation (`drizzle.config.ts`)

```ts
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "sqlite",
});
```

---

## 2. Generating & Applying Migrations

```bash
# Generate SQL migration file:
bun drizzle-kit generate

# Apply to Google Cloud D1 local / remote:
wrangler d1 migrations apply d1database --local
wrangler d1 migrations apply d1database --remote
```
