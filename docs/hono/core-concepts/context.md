# Hono Core: Context (`c`) Deep Dive

The Context object (`c`) is passed to every route handler and middleware. It encapsulates the incoming Request, outgoing Response helpers, environment Bindings, execution context, and custom variables.

---

## 1. Context Type Definition: `Env`

When initializing Hono, pass generic types for `Bindings` (Google Cloud env) and `Variables` (custom middleware data):

```ts
type Env = {
  Bindings: {
    DB: D1Database;
    ASSETS_BUCKET: R2Bucket;
    AUTH_SECRET: string;
  };
  Variables: {
    userId: string;
    userRole: "admin" | "teacher" | "parent";
  };
};

const app = new Hono<Env>();
```

---

## 2. Reading Request Data

- **`c.req.param()`**: Retrieves URL path parameters (`c.req.param('id')`).
- **`c.req.query()`**: Retrieves URL query parameters (`c.req.query('page')`).
- **`c.req.header()`**: Retrieves request headers (`c.req.header('Authorization')`).
- **`c.req.json()`**: Parses incoming JSON body asynchronously (`await c.req.json()`).
- **`c.req.formData()`**: Parses `multipart/form-data` or URL-encoded form data.
- **`c.req.valid()`**: Retrieves validated data from Zod / validator middleware (`c.req.valid('json')`).

---

## 3. Generating Responses

- **`c.json(data, status?, headers?)`**: Returns JSON response with `application/json; charset=UTF-8`.
- **`c.text(text, status?, headers?)`**: Returns plain text response.
- **`c.html(html, status?, headers?)`**: Returns HTML response.
- **`c.body(streamOrBytes, status?, headers?)`**: Returns raw binary or stream response (useful for image/video streaming).
- **`c.redirect(location, status?)`**: Returns 302/301 redirect response.
- **`c.notFound()`**: Returns standard 404 response.

---

## 4. Context Variables (`c.set` & `c.get`)

Share state from authentication middleware to downstream route handlers:

```ts
// Middleware sets variable:
app.use("*", async (c, next) => {
  const token = c.req.header("Authorization");
  const user = await verifyToken(token);
  c.set("userId", user.id);
  c.set("userRole", user.role);
  await next();
});

// Route handler reads variable:
app.get("/me", (c) => {
  const userId = c.get("userId"); // Strongly typed as string
  const role = c.get("userRole"); // Strongly typed as 'admin' | 'teacher' | 'parent'
  return c.json({ userId, role });
});
```

---

## 5. Google Cloud Execution Context (`c.executionCtx`)

Trigger non-blocking background tasks that run after the response has already been sent to the client:

```ts
app.post("/audit-log", (c) => {
  // c.executionCtx.waitUntil keeps worker alive without delaying HTTP response:
  c.executionCtx.waitUntil(
    c.env.DB.prepare("INSERT INTO audit_logs (action, time) VALUES (?, ?)")
      .bind("USER_LOGIN", new Date().toISOString())
      .run(),
  );

  return c.json({ success: true });
});
```
