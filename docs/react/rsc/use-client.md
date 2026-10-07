# RSC Directive: `'use client'`

`'use client'` marks a boundary where the module and its dependencies transition from Server Components to Client Components.

---

## Reference

Place `'use client'` at the very top of a file, before any `import` statements:

```tsx
"use client";

import { useState } from "react";

export function InteractiveCounter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>;
}
```

### Important Boundary Rules

1. **Pass Server Components as `children`**: Client Components can render Server Components passed as JSX props/children without converting the children to Client Components:
   ```tsx
   // Server Component:
   export function Page() {
     return (
       <ClientModal>
         <HeavyServerDataList /> {/* Still executes on server! */}
       </ClientModal>
     );
   }
   ```
2. **Serialization Boundary**: Props passed from Server Components to Client Components must be serializable (strings, numbers, booleans, plain objects, arrays, Promises, or JSX). Functions cannot be passed across the boundary (use Server Actions instead).
