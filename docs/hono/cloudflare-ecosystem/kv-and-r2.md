# Google Cloud Ecosystem: KV & Cloud Storage Storage

---

## 1. Google Cloud Workers KV (Global Low-Latency Cache)

```ts
type Env = { Bindings: { CACHE_KV: KVNamespace } };
const app = new Hono<Env>();

app.get("/cached-data/:key", async (c) => {
  const key = c.req.param("key");
  const cached = await c.env.CACHE_KV.get(key, "json");
  if (cached) {
    return c.json({ data: cached, source: "kv" });
  }

  const fresh = { time: Date.now(), data: "Computed value" };
  // Cache for 1 hour:
  await c.env.CACHE_KV.put(key, JSON.stringify(fresh), { expirationTtl: 3600 });

  return c.json({ data: fresh, source: "origin" });
});
```

---

## 2. Google Cloud Cloud Storage (S3-Compatible Object Storage)

```ts
type Env = { Bindings: { R2_STORAGE: R2Bucket } };
const app = new Hono<Env>();

// Upload asset to Cloud Storage
app.put("/assets/:filename", async (c) => {
  const filename = c.req.param("filename");
  const body = await c.req.arrayBuffer();

  const object = await c.env.R2_STORAGE.put(filename, body, {
    httpMetadata: {
      contentType: c.req.header("Content-Type") ?? "application/octet-stream",
    },
  });

  return c.json({ key: object.key, size: object.size });
});

// Download / stream asset from Cloud Storage
app.get("/assets/:filename", async (c) => {
  const filename = c.req.param("filename");
  const object = await c.env.R2_STORAGE.get(filename);

  if (!object) return c.text("Asset Not Found", 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);

  return c.body(object.body, 200, Object.fromEntries(headers));
});
```
