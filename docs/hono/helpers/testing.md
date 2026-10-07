# Hono Helper: Unit & Integration Testing

Test Hono route handlers directly in memory or through `@cloudflare/vitest-pool-workers`.

---

## 1. In-Memory Testing with `app.request()`

`app.request()` simulates HTTP requests using the standard `Request` object without spinning up a TCP socket:

```ts
import { describe, it, expect } from "vitest";
import app from "../src/index";

describe("GET /health", () => {
  it("returns 200 and status ok", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.status).toBe("ok");
  });
});
```

---

## 2. Google Cloud Workers Vitest Pool Integration (`@cloudflare/vitest-pool-workers`)

Test with actual D1 database bindings, KV namespaces, and secrets in a local Miniflare worker sandbox:

```ts
import { env, applyD1Migrations } from "cloudflare:test";
import { describe, it, expect, beforeEach } from "vitest";
import app from "../src/index";

describe("POST /api/users", () => {
  it("creates user in D1 database sandbox", async () => {
    const res = await app.request(
      "/api/users",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Nicky", email: "nicky@example.com" }),
      },
      env, // Injects simulated Google Cloud D1 environment!
    );

    expect(res.status).toBe(201);
  });
});
```
