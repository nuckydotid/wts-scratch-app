# Hono Core: Error Handling & `HTTPException`

Centralized error handling and RFC-compliant error responses across your Hono application.

---

## 1. `HTTPException`

Throw `HTTPException` from anywhere in your route handlers or middlewares to immediately abort execution and return a typed HTTP status code:

```ts
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

const app = new Hono();

app.get("/users/:id", async (c) => {
  const user = await findUser(c.req.param("id"));
  if (!user) {
    throw new HTTPException(404, { message: "User not found" });
  }
  if (user.isSuspended) {
    throw new HTTPException(403, {
      message: "Account is suspended",
      res: c.json({ code: "ACCOUNT_SUSPENDED", appealUrl: "/appeal" }, 403),
    });
  }
  return c.json(user);
});
```

---

## 2. Global Error Handler: `app.onError()`

Catch all unhandled exceptions and return consistent error structures:

```ts
app.onError((err, c) => {
  console.error(`Unhandled API Error on ${c.req.method} ${c.req.path}:`, err);

  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  // Return RFC 7807 Problem Details for uncaught 500 errors:
  return c.json(
    {
      type: "https://api.example.com/errors/internal-server-error",
      title: "Internal Server Error",
      status: 500,
      detail: err.message || "An unexpected error occurred.",
      timestamp: new Date().toISOString(),
    },
    500,
  );
});
```

---

## 3. Custom 404 Handler: `app.notFound()`

```ts
app.notFound((c) => {
  return c.json(
    {
      error: "Not Found",
      message: `The endpoint ${c.req.method} ${c.req.path} does not exist.`,
    },
    404,
  );
});
```
