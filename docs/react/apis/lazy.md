# Core API: `lazy`

`lazy` lets you defer loading component code until it is rendered for the first time.

---

## Reference

```tsx
import { lazy, Suspense } from "react";

const MarkdownPreview = lazy(() => import("./MarkdownPreview.js"));

export function App() {
  return (
    <Suspense fallback={<div>Loading preview engine...</div>}>
      <MarkdownPreview content={text} />
    </Suspense>
  );
}
```
