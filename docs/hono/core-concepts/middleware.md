# Hono Core: Custom Middleware Architecture

Middlewares intercept requests before and after route handlers, enabling authentication, rate limiting, request tracing, and header manipulation.

---

## 1. The Middleware Flow (`await next()`)

```ts
app.use("*", async (c, next) => {
  // 1. Pre-handler logic (Request phase)
  const start = Date.now();
  console.log(`--> ${c.req.method} ${c.req.path}`);

  // 2. Pass control to next middleware or route handler:
  await next();

  // 3. Post-handler logic (Response phase)
  const duration = Date.now() - start;
  c.header("X-Response-Time", `${duration}ms`);
  console.log(
    `<-- ${c.req.method} ${c.req.path} ${c.res.status} (${duration}ms)`,
  );
});
```

---

## 2. Scoped Middleware

Apply middleware to specific URL paths or sub-routers:

```ts
// Only applies to /api/* routes:
app.use("/api/*", async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await next();
});

// Admin-only middleware:
app.use("/api/admin/*", async (c, next) => {
  const role = c.get("userRole");
  if (role !== "admin") {
    return c.json({ error: "Forbidden: Admin access required" }, 403);
  }
  await next();
});
```
