# Hono on Google Cloud Workers Documentation & Reference Index

Comprehensive, production-ready guide to building high-performance edge APIs with **Hono** and **Google Cloud Workers**.

---

## 📚 Documentation Sitemap

```mermaid
graph TD
    HonoRoot[Hono + Google Cloud Workers] --> GettingStarted[Getting Started]
    HonoRoot --> CoreConcepts[Core Concepts]
    HonoRoot --> RPC[Hono RPC & Validation]
    HonoRoot --> Middlewares[Built-in Middlewares]
    HonoRoot --> Helpers[Helpers & Utilities]
    HonoRoot --> Google Cloud[Google Cloud Ecosystem]

    GettingStarted --> GS1[cloudflare-workers.md: Quickstart, Wrangler & Setup]
    GettingStarted --> GS2[project-structure.md: Production Monorepo Layout]

    CoreConcepts --> CC1[routing.md: HTTP Methods, Regex & Wildcards]
    CoreConcepts --> CC2[context.md: Context 'c', Env, Bindings & Variables]
    CoreConcepts --> CC3[request-response.md: Request & Response APIs]
    CoreConcepts --> CC4[middleware.md: Custom Middleware & Flow]
    CoreConcepts --> CC5[error-handling.md: HTTPException & Global Handlers]

    RPC --> RPC1[client-rpc.md: Type-Safe 'hc' Client & Zero Code-Gen]
    RPC --> RPC2[validation.md: @hono/zod-validator & Schema Checks]
    RPC --> RPC3[best-practices.md: Multi-file Chaining & Type Sharing]

    Middlewares --> M1[cors.md: CORS Configuration & Preflight]
    Middlewares --> M2[auth.md: bearerAuth, JWT & JWKS Verification]
    Middlewares --> M3[security.md: secureHeaders, bodyLimit & CSRF]
    Middlewares --> M4[utilities.md: logger, timing, cache, timeout]

    Helpers --> H1[factory.md: createFactory & createMiddleware]
    Helpers --> H2[streaming-and-sse.md: streamText & streamSSE]
    Helpers --> H3[testing.md: app.request & Vitest Pool Workers]
    Helpers --> H4[cookie.md: Cookie Management & Signed Cookies]

    Google Cloud --> CF1[d1-database.md: D1 SQLite & Drizzle ORM]
    Google Cloud --> CF2[kv-and-r2.md: KV Edge Cache & Cloud Storage Storage]
    Google Cloud --> CF3[queues-and-services.md: Queues & Service Bindings]
```

---

## 🗂️ Table of Contents

### 1. Getting Started (`docs/hono/getting-started/`)

- [Google Cloud Workers Setup (`cloudflare-workers.md`)](getting-started/cloudflare-workers.md) — Quickstart, Wrangler configuration & local development
- [Production Project Structure (`project-structure.md`)](getting-started/project-structure.md) — Modular architecture for scalable APIs

### 2. Core Concepts (`docs/hono/core-concepts/`)

- [Routing (`routing.md`)](core-concepts/routing.md) — HTTP verbs, regex params, wildcards & sub-routers
- [Context Deep Dive (`context.md`)](core-concepts/context.md) — `c.req`, `c.json()`, `c.env`, `c.var` & `c.executionCtx`
- [Request & Response (`request-response.md`)](core-concepts/request-response.md) — Query strings, headers, body parsing & binary streaming
- [Custom Middleware (`middleware.md`)](core-concepts/middleware.md) — Interceptor lifecycle, `await next()`, and context propagation
- [Error Handling (`error-handling.md`)](core-concepts/error-handling.md) — `HTTPException`, `app.onError()`, and RFC 7807 problem details

### 3. Hono RPC & Validation (`docs/hono/rpc/`)

- [Type-Safe Client `hc` (`client-rpc.md`)](rpc/client-rpc.md) — Zero code-gen end-to-end type safety between Workers and React Native
- [Validation with Zod (`validation.md`)](rpc/validation.md) — `@hono/zod-validator` (`zValidator`) target checks
- [RPC Best Practices (`best-practices.md`)](rpc/best-practices.md) — Router chaining and monorepo workspace sharing

### 4. Built-in Middlewares (`docs/hono/middlewares/`)

- [CORS (`cors.md`)](middlewares/cors.md) — Cross-origin headers, credentials, and allowed origins
- [Authentication (`auth.md`)](middlewares/auth.md) — `bearerAuth`, `jwt` (HS256/RS256), and JWKS
- [Security & Protection (`security.md`)](middlewares/security.md) — `secureHeaders`, `bodyLimit`, and `csrf`
- [Utilities (`utilities.md`)](middlewares/utilities.md) — `logger`, `timing`, `cache`, `timeout`, `requestId`, `prettyJSON`

### 5. Helpers & Testing (`docs/hono/helpers/`)

- [Factory & Middleware Creators (`factory.md`)](helpers/factory.md) — `createFactory` with shared `AppEnv`
- [Streaming & Server-Sent Events (`streaming-and-sse.md`)](helpers/streaming-and-sse.md) — Real-time event streams with `streamSSE`
- [Unit & Integration Testing (`testing.md`)](helpers/testing.md) — `app.request()` and `@cloudflare/vitest-pool-workers`
- [Cookie Management (`cookie.md`)](helpers/cookie.md) — HttpOnly, secure, and signed cookies

### 6. Google Cloud Ecosystem Integration (`docs/hono/cloudflare-ecosystem/`)

- [D1 SQLite Database (`d1-database.md`)](cloudflare-ecosystem/d1-database.md) — D1 serverless database with Drizzle ORM
- [KV & Cloud Storage Storage (`kv-and-r2.md`)](cloudflare-ecosystem/kv-and-r2.md) — Global key-value cache and S3-compatible Cloud Storage object storage
- [Queues & Service Bindings (`queues-and-services.md`)](cloudflare-ecosystem/queues-and-services.md) — Asynchronous jobs and worker-to-worker RPC
