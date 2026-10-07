# Drizzle ORM: Queries & Relational API

Executing type-safe SQL queries with Drizzle ORM on D1.

---

## 1. Select, Insert, Update, Delete

```ts
import { eq, and, desc, inArray } from "drizzle-orm";
import { student, studentParentLink } from "./schema";

// Select with joins:
const students = await db
  .select({
    id: student.id,
    name: student.legalName,
  })
  .from(student)
  .leftJoin(studentParentLink, eq(student.id, studentParentLink.studentId))
  .where(eq(studentParentLink.parentUserId, userId))
  .orderBy(desc(student.createdAt));

// Insert with returning:
const [newStudent] = await db
  .insert(student)
  .values({
    id: crypto.randomUUID(),
    nis: "12345",
    legalName: "Nicky",
    birthDate: "2020-01-01",
    createdAt: new Date(),
  })
  .returning();
```
