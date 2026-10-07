# Hono Helper: Cookie Management

```ts
import {
  getCookie,
  setCookie,
  deleteCookie,
  getSignedCookie,
  setSignedCookie,
} from "hono/cookie";

app.post("/login", async (c) => {
  // Set HttpOnly secure session cookie:
  setCookie(c, "session_id", "sess_abc123", {
    path: "/",
    secure: true,
    httpOnly: true,
    maxAge: 86400 * 7, // 7 days
    sameSite: "Lax",
  });

  return c.json({ success: true });
});

app.get("/session", (c) => {
  const sessionId = getCookie(c, "session_id");
  return c.json({ sessionId });
});
```
