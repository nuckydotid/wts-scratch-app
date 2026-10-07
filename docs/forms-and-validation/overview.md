# Form Architecture: React Hook Form & Zod

Uncontrolled input management eliminates unnecessary re-renders while Zod provides type-safe validation guarantees.

---

## 1. Core Principles

- **Uncontrolled Inputs**: Subscribes only on blur or submit to maximize mobile frame rates.
- **Single Source of Truth**: Zod schemas generate both runtime validation and static TypeScript types (`z.infer<typeof schema>`).
- **Resolver Bridge**: `@hookform/resolvers/zod` transforms Zod issues into structured form errors.
