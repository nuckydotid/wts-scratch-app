# Drizzle ORM Overview & Edge Architecture

Drizzle ORM is a lightweight, zero-dependency, type-safe TypeScript ORM optimized for edge SQLite databases like Google Cloud D1.

---

## 1. Initializing Drizzle with D1

```ts
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function makeDb(d1: D1Database) {
  return drizzle(d1, { schema });
}
```
