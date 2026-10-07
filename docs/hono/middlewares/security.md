# Hono Middleware: Security & Protection

---

## 1. `secureHeaders` (OWASP Security Headers)

Injects industry-standard HTTP security headers (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`):

```ts
import { secureHeaders } from "hono/secure-headers";

app.use(
  "*",
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://challenges.cloudflare.com"],
    },
    strictTransportSecurity: "max-age=63072000; includeSubDomains; preload",
    xFrameOptions: "DENY",
    xContentTypeOptions: "nosniff",
  }),
);
```

---

## 2. `bodyLimit` (DDoS & Payload Size Limiting)

Prevents memory exhaustion on edge workers by rejecting oversized payloads:

```ts
import { bodyLimit } from "hono/body-limit";

app.post(
  "/upload",
  bodyLimit({
    maxSize: 10 * 1024 * 1024, // 10MB limit
    onError: (c) => {
      return c.json(
        { error: "Payload Too Large: Maximum upload size is 10MB" },
        413,
      );
    },
  }),
);
```

---

## 3. `csrf` (Cross-Site Request Forgery Protection)

```ts
import { csrf } from "hono/csrf";

app.use(
  "*",
  csrf({
    origin: ["https://app.example.com"],
  }),
);
```
