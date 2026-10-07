# RSC Directive: `'use server'` & Server Functions

`'use server'` marks a function or file as a **Server Action / Server Function** callable from client components.

---

## Reference

### File-Level Server Actions

```tsx
// app/actions.ts
"use server";

import db from "@/db";

export async function updateUserEmail(userId: string, email: string) {
  await db.user.update({ where: { id: userId }, data: { email } });
  return { success: true };
}
```

### Inline Function Server Action

```tsx
export function EditProfile({ userId }: { userId: string }) {
  async function handleSubmit(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    await saveEmail(userId, email);
  }

  return (
    <form action={handleSubmit}>
      <input name="email" type="email" />
      <button type="submit">Save</button>
    </form>
  );
}
```
