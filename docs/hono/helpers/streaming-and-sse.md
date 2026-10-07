# Hono Helper: Streaming & Server-Sent Events (SSE)

Stream chunks of data or real-time event streams from Google Cloud Workers to clients.

---

## 1. `streamText` & `stream`

```ts
import { Hono } from "hono";
import { streamText } from "hono/streaming";

const app = new Hono();

app.get("/ai-stream", (c) => {
  return streamText(c, async (stream) => {
    // Write tokens progressively:
    await stream.writeln("Thinking...");
    await stream.sleep(500);
    await stream.writeln("Here is the AI response line by line...");
  });
});
```

---

## 2. `streamSSE` (Server-Sent Events)

```ts
import { streamSSE } from "hono/streaming";

app.get("/events", (c) => {
  return streamSSE(c, async (stream) => {
    let id = 0;
    while (true) {
      await stream.writeSSE({
        data: JSON.stringify({
          message: "Live notification",
          time: Date.now(),
        }),
        event: "update",
        id: String(id++),
      });
      await stream.sleep(2000);
    }
  });
});
```
