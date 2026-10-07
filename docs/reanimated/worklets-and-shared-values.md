# Reanimated 4: Shared Values & Derived Values

Shared values hold reactive values on the UI thread.

---

## 1. `useSharedValue`

```tsx
import { useSharedValue } from "react-native-reanimated";

export function Card() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  return <AnimatedCard scale={scale} opacity={opacity} />;
}
```
