# Zod v4: Schema Definitions & Custom Refinements

---

## 1. Complex Schema Patterns

```ts
import { z } from "zod";

export const studentCreateSchema = z.object({
  nis: z.string().min(4, "NIS minimal 4 digit"),
  legalName: z.string().min(2, "Nama minimal 2 huruf"),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal YYYY-MM-DD"),
  parentUserId: z.string().optional(),
});
```
