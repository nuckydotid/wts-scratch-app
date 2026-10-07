# Package Update Notes

These packages have available major version bumps but **cannot be updated yet** due to upstream compatibility constraints.

## Blocked Updates

### eslint `^9.39.4` → `^10.8.0`

**Reason**: `eslint-plugin-react` v7 has a maximum peer dependency of `^9.7`. It does not support ESLint 10.

```log
TypeError: Error while loading rule 'react/display-name':
contextOrFilename.getFilename is not a function
```

**Wait for**: `eslint-plugin-react` v8 or higher that supports ESLint 10.

---

### jest `~29.7.0` → `~30.4.2` + @types/jest `29.5.14` → `30.0.0`

**Reason**: `jest-expo@57.0.2` is incompatible with Jest 30.

```log
TypeError: this._moduleMocker.clearMocksOnScope is not a function
```

`jest-expo` (bundled with Expo SDK 57) calls an internal Jest API that was removed/changed in Jest 30.

**Wait for**: `jest-expo@58` or higher that supports Jest 30.

---

### react-native-gesture-handler `~2.32.0` → `~3.1.0`

**Reason**: `heroui-native@1.0.6` lists `react-native-gesture-handler` as a peer dependency with `^2.28.0`.

```
// heroui-native/package.json
"peerDependencies": {
  "react-native-gesture-handler": "^2.28.0"
}
```

Installing v3 would either create a dual-version conflict or break heroui-native's internal usage of Gesture Handler 2.x APIs.

**Wait for**: `heroui-native` bumps its peer dependency to `^3.0.0`.

---

### typescript `~6.0.3` → `~7.0.2`

**Reason**: Major breaking changes. TypeScript 7 is a significant release. All TypeScript-dependent packages (`typescript-eslint`, `expo`, `heroui-native`, `react-native`) need to be verified for compatibility first. Additionally, the project uses `strict: true` — any breaking changes in type inference would require code changes.

**Wait for**: All major dependencies (`eslint-config-expo`, `typescript-eslint`, `expo`) to officially support TypeScript 7, and a planned migration window to handle any type errors.

---

## Successfully Updated

| Package                 | From     | To        | Safe Because                                            |
| ----------------------- | -------- | --------- | ------------------------------------------------------- |
| `react-native`          | `0.86.0` | `0.86.2`  | Patch bump, bugfixes only                               |
| `react-native-worklets` | `0.10.0` | `0.11.3`  | Minor bump, within reanimated's `0.10.x - 0.11.x` range |
| `@types/node`           | —        | `^26.1.2` | Added as dev dependency (side-effect from jest install) |
| `tailwind-variants`     | `^3.2.2` | `^3.3.0`  | Minor bump, compatible                                  |
