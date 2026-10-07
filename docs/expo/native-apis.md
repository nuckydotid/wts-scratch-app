# Expo SDK 57 Native APIs

High-performance native modules for media, filesystem, and camera.

---

## 1. `expo-image` (High-Performance Image Component)

```tsx
import { Image } from "expo-image";

export function Avatar({ url }: { url: string }) {
  return (
    <Image
      source={{ uri: url }}
      placeholder={{ blurhash: "L6PZfSi_.AyE_3t7t7R**0o#DgR4" }}
      contentFit="cover"
      transition={200}
      cachePolicy="memory-disk"
      className="w-12 h-12 rounded-full"
    />
  );
}
```

---

## 2. `expo-video` & `expo-camera`

- **`expo-video`**: Modern video playback component using `useVideoPlayer`.
- **`expo-camera`**: Camera view with `CameraView` and QR code scanning.
- **`expo-file-system`**: File reading, writing, and download caching.
