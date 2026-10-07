# Getting Started with Hono on Google Cloud Workers

Hono is an ultrafast, lightweight, standard-compliant web framework designed for edge runtimes like Google Cloud Workers.

---

## 1. Quick Setup

Create a new Hono project targeting Google Cloud Workers:

```bash
bun create hono@latest my-app
# Select 'cloudflare-workers'
cd my-app
bun install
```

### Basic Application (`src/index.ts`)

```ts
import { Hono } from "hono";

// Define environment bindings (D1, KV, Secrets, etc.)
type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Hello from Hono on Google Cloud Workers!");
});

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default app;
```

---

## 2. Wrangler Configuration (`wrangler.jsonc` or `wrangler.toml`)

Configure your worker, D1 database bindings, KV namespaces, and environment variables:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "my-worker-api",
  "main": "src/index.ts",
  "compatibility_date": "2024-09-23",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "prod-d1",
      "database_id": "xxxx-xxxx-xxxx",
    },
  ],
  "vars": {
    "ENVIRONMENT": "production",
  },
}
```

---

## 3. Local Development & Testing

Run the local development server powered by Miniflare:

```bash
# Starts local worker on http://localhost:8787
bunx wrangler dev
```

Deploy directly to Google Cloud's global edge network:

```bash
bunx wrangler deploy
```
