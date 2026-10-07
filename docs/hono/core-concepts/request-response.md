# Hono Core: Request & Response Handling

Hono conforms strictly to Web Standard `Request` and `Response` objects while providing ergonomic convenience APIs.

---

## 1. Request APIs (`c.req`)

```ts
app.post("/api/upload", async (c) => {
  // URL & Path info:
  const url = c.req.url; // "https://example.com/api/upload?type=avatar"
  const method = c.req.method; // "POST"
  const path = c.req.path; // "/api/upload"

  // Query strings:
  const type = c.req.query("type"); // "avatar"
  const allQueries = c.req.queries("tags"); // ["react", "hono"] for ?tags=react&tags=hono

  // Headers:
  const contentType = c.req.header("Content-Type");

  // Body Parsing:
  const formData = await c.req.formData();
  const file = formData.get("file") as File;

  return c.json({ filename: file.name, size: file.size });
});
```

---

## 2. Response Helpers & Custom Headers

```ts
app.get("/api/custom-response", (c) => {
  // Set custom headers:
  c.header("X-Custom-Header", "Value");
  c.header("Cache-Control", "public, max-age=3600");

  // Set HTTP status code:
  c.status(200);

  return c.json({ message: "Success" });
});
```
