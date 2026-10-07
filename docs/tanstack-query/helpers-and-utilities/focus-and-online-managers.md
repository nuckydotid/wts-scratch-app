# Helpers: `focusManager` & `onlineManager`

Coordinate window focus, mobile AppState, and network connectivity state.

---

## 1. `onlineManager` (Network Connectivity)

```ts
import { onlineManager } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(
      Boolean(state.isConnected && state.isInternetReachable !== false),
    );
  });
});
```

---

## 2. `focusManager` (React Native AppState)

```ts
import { focusManager } from "@tanstack/react-query";
import { AppState, type AppStateStatus, Platform } from "react-native";

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

const subscription = AppState.addEventListener("change", onAppStateChange);
```
