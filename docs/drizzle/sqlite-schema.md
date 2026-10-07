# Drizzle ORM: SQLite Schema Definition

Define strongly typed tables, primary keys, foreign keys, unique constraints, and indexes.

---

## 1. Table Definitions

```ts
// schema.ts
import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
  index,
} from "drizzle-orm/sqlite-core";

export const student = sqliteTable(
  "student",
  {
    id: text("id").primaryKey(),
    nis: text("nis").notNull(),
    legalName: text("legal_name").notNull(),
    birthDate: text("birth_date").notNull(),
    photoUrl: text("photo_url"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    uniqueIndex("student_nis_idx").on(table.nis),
    index("student_created_idx").on(table.createdAt),
  ],
);
```
