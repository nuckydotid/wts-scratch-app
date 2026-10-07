# Google Cloud Ecosystem: Queues, Hyperdrive & Service Bindings

---

## 1. Google Cloud Queues (Asynchronous Background Jobs)

Publish background tasks from Hono handlers without slowing down HTTP responses:

```ts
type Env = {
  Bindings: {
    EMAIL_QUEUE: Queue<{ to: string; subject: string; body: string }>;
  };
};
const app = new Hono<Env>();

app.post("/send-welcome", async (c) => {
  const { email, name } = await c.req.json();

  // Send message to Queue:
  await c.env.EMAIL_QUEUE.send({
    to: email,
    subject: `Welcome ${name}!`,
    body: "Thank you for joining Worktrees Studio.",
  });

  return c.json({ enqueued: true });
});
```

---

## 2. Service Bindings (Zero-Latency Worker-to-Worker RPC)

Call internal microservices directly in memory without internet routing overhead:

```ts
type Env = { Bindings: { AUTH_SERVICE: Fetcher } };
const app = new Hono<Env>();

app.get("/verify", async (c) => {
  // Dispatches directly to the target worker:
  const res = await c.env.AUTH_SERVICE.fetch("https://auth-worker/verify", {
    headers: { Authorization: c.req.header("Authorization") ?? "" },
  });

  const authData = await res.json();
  return c.json(authData);
});
```
