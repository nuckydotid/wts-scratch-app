# Hono RPC: Schema Validation with `@hono/zod-validator`

Validate request bodies, query parameters, URL path parameters, and headers using Zod schemas.

---

## 1. Syntax & Targets

```ts
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const querySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
  search: z.string().optional(),
});

app.get("/posts", zValidator("query", querySchema), (c) => {
  const { page, limit, search } = c.req.valid("query");
  return c.json({ page, limit, search });
});
```

### Supported Validation Targets:

- **`'json'`**: Request body JSON (`c.req.valid('json')`).
- **`'query'`**: URL query parameters (`c.req.valid('query')`).
- **`'param'`**: URL path parameters (`c.req.valid('param')`).
- **`'header'`**: HTTP request headers (`c.req.valid('header')`).
- **`'form'`**: `multipart/form-data` or form URL encoded.
- **`'cookie'`**: Request cookies.

---

## 2. Customizing Validation Error Formatting

By default, invalid requests return HTTP 400 with Zod issues. You can customize the response format:

```ts
app.post(
  "/login",
  zValidator("json", loginSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          code: "VALIDATION_ERROR",
          message: "Invalid login parameters",
          errors: result.error.issues.map((i) => ({
            field: i.path.join("."),
            message: i.message,
          })),
        },
        422,
      );
    }
  }),
  async (c) => {
    const { email, password } = c.req.valid("json");
    // Proceed with authentication
  },
);
```
