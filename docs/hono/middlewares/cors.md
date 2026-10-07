# Hono Middleware: `cors`

The `cors` middleware enables Cross-Origin Resource Sharing for web browsers and mobile webviews.

---

## Reference

```ts
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

app.use(
  "/api/*",
  cors({
    origin: (origin) => {
      // Allow specific production domain, staging, or localhost dev:
      if (
        origin.endsWith(".example.com") ||
        origin.startsWith("http://localhost:") ||
        origin.startsWith("exp://")
      ) {
        return origin;
      }
      return "https://app.example.com";
    },
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Custom-Header"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 86400,
    credentials: true,
  }),
);
```
