# HeroUI Native: Component Primitives Reference

---

## 1. Button

```tsx
import { Button } from "@repo/worktrees-studio-ds";

export function ActionButton() {
  return (
    <Button
      variant="solid"
      color="primary"
      size="md"
      onPress={() => console.log("Pressed")}
    >
      Simpan Perubahan
    </Button>
  );
}
```

---

## 2. Teleport & Sheet

- **`TeleportProvider`**: Portal provider for overlays outside component hierarchy.
- **`FullSheet` & `Drawer`**: Animated slide-up sheets.
