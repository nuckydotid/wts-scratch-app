# Hono Middleware: `bearerAuth` & `jwt`

---

## 1. `bearerAuth` (Static Tokens / API Keys)

```ts
import { bearerAuth } from "hono/bearer-auth";

app.use(
  "/api/webhook/*",
  bearerAuth({
    token: "my-super-secret-api-key",
  }),
);
```

---

## 2. `jwt` (RS256 / HS256 JWT Token Verification)

```ts
import { jwt } from "hono/jwt";

app.use(
  "/api/protected/*",
  jwt({
    secret: "my-secret-jwt-key",
    alg: "HS256",
  }),
);

app.get("/api/protected/profile", (c) => {
  // Payload is automatically decoded and stored in c.get('jwtPayload'):
  const payload = c.get("jwtPayload");
  return c.json({ user: payload });
});
```

---

## 3. Remote JWKS Verification (Clerk, Auth0, Firebase, Google)

```ts
import { jwks } from "hono/jwks";

app.use(
  "/api/v1/*",
  jwks({
    jwks_uri: "https://auth.example.com/.well-known/jwks.json",
  }),
);
```
