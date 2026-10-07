# Reanimated 4: Animation Helpers & Animated Styles

---

## 1. `useAnimatedStyle` with `withSpring` & `withTiming`

```tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export function ExpandableBox({ isExpanded }: { isExpanded: boolean }) {
  const height = useSharedValue(60);

  const animatedStyle = useAnimatedStyle(() => ({
    height: withSpring(isExpanded ? 200 : 60, { damping: 15, stiffness: 120 }),
    opacity: withTiming(isExpanded ? 1 : 0.7, { duration: 200 }),
  }));

  return (
    <Animated.View
      style={[{ width: "100%", backgroundColor: "#f0f0f0" }, animatedStyle]}
    />
  );
}
```
