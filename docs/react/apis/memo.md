# Core API: `memo`

`memo` lets you skip re-rendering a component when its props are unchanged.

---

## Reference

```tsx
import { memo } from "react";

export const UserCard = memo(function UserCard({
  name,
  avatarUrl,
}: UserCardProps) {
  return (
    <div className="card">
      <img src={avatarUrl} alt={name} />
      <h3>{name}</h3>
    </div>
  );
});
```

### Custom Comparison Function

By default, `memo` does a shallow equality check (`Object.is`) on every prop. You can provide a custom comparator:

```tsx
export const Chart = memo(
  function Chart({ dataset }: ChartProps) {
    return <Canvas dataset={dataset} />;
  },
  (prevProps, nextProps) => {
    return (
      prevProps.dataset.id === nextProps.dataset.id &&
      prevProps.dataset.version === nextProps.dataset.version
    );
  },
);
```
