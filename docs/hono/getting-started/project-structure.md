# Recommended Project Structure for Production Hono Apps

A modular, scalable architecture for fullstack and monorepo Hono APIs:

```
api/
├── src/
│   ├── index.ts               # App entrypoint, global middlewares, route mounting
│   ├── routes/                # Domain-specific route groups
│   │   ├── auth.ts            # Authentication & JWT endpoints
│   │   ├── users.ts           # User profiles & management
│   │   ├── announcements.ts   # Announcements & notifications
│   │   └── gallery.ts         # Photo & media endpoints
│   ├── middlewares/           # Custom reusable middlewares
│   │   ├── auth-guard.ts      # Bearer / JWT token verification
│   │   └── rate-limiter.ts    # Edge rate limiting via KV / Durable Objects
│   ├── db/                    # Database ORM schemas & migrations
│   │   ├── schema.ts          # Drizzle / Kysely table schemas
│   │   └── migrations/        # SQL migration files
│   ├── types/                 # Shared TypeScript interfaces & Bindings
│   │   └── env.ts             # Bindings & Variables type definitions
│   └── lib/                   # Utility helpers & crypto tools
│       ├── errors.ts          # RFC 7807 problem details
│       └── jwt.ts             # RS256 / HS256 token verification
├── wrangler.jsonc             # Google Cloud Workers configuration
├── vitest.config.mts          # @cloudflare/vitest-pool-workers test runner
└── package.json
```
