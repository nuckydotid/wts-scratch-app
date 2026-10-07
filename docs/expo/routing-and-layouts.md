# Expo Router v57: Typed Routing & Layouts

File-based routing system for React Native with full TypeScript support.

---

## 1. Directory Structure & Route Groups

```
app/
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   └── otp.tsx
└── (app)/
    ├── _layout.tsx
    ├── (admin)/
    ├── (teacher)/
    └── (parent)/
```

---

## 2. Navigation Hooks

```tsx
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useCallback } from "react";

export function StudentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Refetch data when screen gains focus:
  useFocusEffect(
    useCallback(() => {
      // refetch()
    }, []),
  );

  return (
    <Button onPress={() => router.push(`/(app)/parent/chat-room/${id}`)}>
      Open Chat
    </Button>
  );
}
```
