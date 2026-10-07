# Built-in Component: `<Fragment>` (`<>...</>`)

`<Fragment>` lets you group elements together without adding extra wrapper DOM nodes.

---

## Reference

```tsx
// Short syntax (does not accept keys):
<>
  <ChildA />
  <ChildB />
</>;

// Explicit syntax (required when passing key in a list):
import { Fragment } from "react";

function Glossary({ items }: { items: Item[] }) {
  return (
    <dl>
      {items.map((item) => (
        <Fragment key={item.id}>
          <dt>{item.term}</dt>
          <dd>{item.description}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
```
