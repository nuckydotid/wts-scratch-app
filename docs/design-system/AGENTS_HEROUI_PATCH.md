<!-- HEROUI-NATIVE-PATCH-AGENTS-MD-START -->

[HeroUI Native Web Compatibility Patch]|root: ./patches/heroui-native@1.0.6.patch|STOP. On heroui-native version bumps, read this file first then reapply.|The patch removes BottomSheet and its dependencies (@gorhom/bottom-sheet) for web compatibility. See below for re-patching steps.

# Steps to reproduce patch on new version

## 1. Extract the new version

```bash
bun install heroui-native@<NEW_VERSION>
```

## 2. Remove bottom-sheet files from node_modules

### Delete directories and files

```bash
# Component
rm -rf node_modules/heroui-native/lib/module/components/bottom-sheet

# Primitives
rm -rf node_modules/heroui-native/lib/module/primitives/bottom-sheet

# Optional module
rm -f node_modules/heroui-native/lib/module/optional/gorhom-bottom-sheet.js
rm -f node_modules/heroui-native/lib/module/optional/gorhom-bottom-sheet.js.map

# Internal component helpers
rm -f node_modules/heroui-native/lib/module/helpers/internal/components/bottom-sheet-content.js
rm -f node_modules/heroui-native/lib/module/helpers/internal/components/bottom-sheet-content-container.js

# Internal hooks
rm -f node_modules/heroui-native/lib/module/helpers/internal/hooks/use-bottom-sheet-gesture-handlers.js
rm -f node_modules/heroui-native/lib/module/helpers/internal/hooks/use-popup-bottom-sheet-content-animation.js

# Internal contexts
rm -f node_modules/heroui-native/lib/module/helpers/internal/contexts/bottom-sheet-is-dragging-context.js

# External hooks
rm -f node_modules/heroui-native/lib/module/helpers/external/hooks/use-bottom-sheet-aware-handlers.js

# Internal types
rm -f node_modules/heroui-native/lib/module/helpers/internal/types/bottom-sheet.js
```

### Remove source files

```bash
rm -rf node_modules/heroui-native/src/components/bottom-sheet
rm -rf node_modules/heroui-native/src/primitives/bottom-sheet
rm -f node_modules/heroui-native/src/optional/gorhom-bottom-sheet.ts
rm -f node_modules/heroui-native/src/helpers/internal/components/bottom-sheet-content.tsx
rm -f node_modules/heroui-native/src/helpers/internal/components/bottom-sheet-content-container.tsx
rm -f node_modules/heroui-native/src/helpers/internal/hooks/use-bottom-sheet-gesture-handlers.ts
rm -f node_modules/heroui-native/src/helpers/internal/hooks/use-popup-bottom-sheet-content-animation.ts
rm -f node_modules/heroui-native/src/helpers/internal/contexts/bottom-sheet-is-dragging-context.ts
rm -f node_modules/heroui-native/src/helpers/internal/types/bottom-sheet.ts
rm -f node_modules/heroui-native/src/helpers/external/hooks/use-bottom-sheet-aware-handlers.ts
rm -f node_modules/heroui-native/src/styles/components/bottom-sheet.css
```

## 3. Fix barrel exports (remove bottom-sheet re-exports)

### Compiled JS files

Edit these files to remove the bottom-sheet `export *` line(s):

- **`lib/module/index.js`** — remove `export * from "./components/bottom-sheet/index.js";`
- **`lib/module/helpers/internal/components/index.js`** — remove exports for `bottom-sheet-content` and `bottom-sheet-content-container`
- **`lib/module/helpers/internal/hooks/index.js`** — remove exports for `use-bottom-sheet-gesture-handlers` and `use-popup-bottom-sheet-content-animation`
- **`lib/module/helpers/internal/contexts/index.js`** — remove export for `bottom-sheet-is-dragging-context`
- **`lib/module/helpers/external/hooks/index.js`** — remove export for `use-bottom-sheet-aware-handlers`
- **`lib/module/helpers/internal/types/index.js`** — remove export for `bottom-sheet`

### TypeScript declaration files

Same edits for `.d.ts` files under `lib/typescript/src/`:

- **`lib/typescript/src/index.d.ts`**
- **`lib/typescript/src/helpers/internal/components/index.d.ts`**
- **`lib/typescript/src/helpers/internal/hooks/index.d.ts`**
- **`lib/typescript/src/helpers/internal/contexts/index.d.ts`**
- **`lib/typescript/src/helpers/external/hooks/index.d.ts`**
- **`lib/typescript/src/helpers/internal/types/index.d.ts`**

### Source files

Same edits for `.ts`/`.tsx` files under `src/`:

- **`src/index.tsx`**
- **`src/helpers/internal/components/index.ts`**
- **`src/helpers/internal/hooks/index.ts`**
- **`src/helpers/internal/contexts/index.ts`**
- **`src/helpers/external/hooks/index.ts`**
- **`src/helpers/internal/types/index.ts`**

## 4. Fix type references in menu/popover/select

These `.d.ts` files inline `@gorhom/bottom-sheet` types. Remove the import and bottom-sheet interface:

- **`lib/typescript/src/components/menu/menu.types.d.ts`** — remove `import type { BottomSheetProps }`, remove `MenuContentBottomSheetProps`, update `MenuContentProps` union, change `MenuPresentation` to `'popover'`
- **`lib/typescript/src/components/menu/menu.d.ts`** — replace `import("@gorhom/bottom-sheet/lib/typescript/types").BottomSheetMethods` with `never`
- **`lib/typescript/src/components/popover/popover.types.d.ts`** — same as menu types
- **`lib/typescript/src/components/popover/popover.d.ts`** — same as menu d.ts
- **`lib/typescript/src/components/select/select.types.d.ts`** — same as menu types
- **`lib/typescript/src/components/select/select.d.ts`** — same as menu d.ts

## 5. Commit the patch

```bash
bun patch --commit 'node_modules/heroui-native'
```

## 6. Remove the dependency

```bash
# Edit package.json to remove "@gorhom/bottom-sheet" from dependencies
bun install
# Clean up leftover node_modules
rm -rf node_modules/@gorhom
```

## 7. Fix colorKit crash on variant="ghost"/"outline"

The Button component calls `colorKit.setAlpha(themeColorDefaultHover, 0.3).hex()` for `outline` and `ghost` variants. If `themeColorDefaultHover` is empty (e.g., when Uniwind's `dummyParent` lacks a `.light`/`.dark` class and CSS variables don't resolve), `colorKit.RGB()` crashes.

### Edit `lib/module/components/button/button.js`

Replace both occurrences of:

```js
return colorKit.setAlpha(themeColorDefaultHover, 0.3).hex();
```

with:

```js
return themeColorDefaultHover
  ? colorKit.setAlpha(themeColorDefaultHover, 0.3).hex()
  : "transparent";
```

This guards against empty color strings and silences the console error.

## Rationale

- `BottomSheet` is the only component with a hard dependency on `@gorhom/bottom-sheet`, which is native-only (no React Native Web support)
- `Menu`, `Popover`, and `Select` support both `popover` (web-compatible) and `bottom-sheet` (native-only) presentations; removing the bottom-sheet type references makes these components web-only
- In `Menu`, `Popover`, and `Select`, the `presentation='bottom-sheet'` runtime string check still exists in the compiled JS — it simply won't match at runtime since no code passes that value anymore
- `colorKit.RGB()` can't parse empty `themeColorDefaultHover` caused by unresolved CSS variables in Uniwind's dummyParent; the ternary guard provides an explicit fallback

## Additional Web-Incompatible Components

These HeroUI Native components are **not web-compatible** (React Native Web + React 19 + Hermes) and were removed from our usage. They remain available in the hero-ui-native package but should NOT be imported by our code.

### Portal-dependent (broken on React 19 web)

| Component    | Removed From              | Reason                                                  |
| ------------ | ------------------------- | ------------------------------------------------------- |
| `Dialog`     | Barrel export, block file | Relies on portal/teleport — broken on React 19 + Hermes |
| `Menu`       | Barrel export, block file | Relies on portal for dropdown positioning               |
| `Popover`    | Barrel export, block file | Relies on portal for overlay positioning                |
| `Select`     | Barrel export, block file | Relies on portal for dropdown list                      |
| `Toast`      | Barrel export, block file | Relies on portal for overlay notification               |
| `SubMenu`    | Barrel export, block file | Relies on portal for nested menus                       |
| `InputGroup` | Barrel export, block file | Relies on portal for addon positioning                  |
| `InputOTP`   | Barrel export, block file | Relies on portal for OTP field behavior                 |

### Other web compatibility issues

| Component           | Removed From              | Reason                                                                                     |
| ------------------- | ------------------------- | ------------------------------------------------------------------------------------------ |
| `PressableFeedback` | Barrel export, block file | Animated press feedback uses reanimated LayoutAnimation not supported on web               |
| `ScrollShadow`      | Barrel export, block file | Shadow gradient rendering uses native modules                                              |
| `SkeletonGroup`     | Block file + registry     | Redundant — use `Skeleton` directly (individual skeletons compose better on all platforms) |

### What to remove if re-adding on a future version

These two barrel files need export lines removed:

1. **`src/components/index.ts`** — remove these export lines if present:
   - `Dialog`, `InputGroup`, `InputOTP`, `Menu`, `Popover`, `PressableFeedback`, `ScrollShadow`, `Select`, `SkeletonGroup`, `SubMenu`, `Toast`
   - Note: these are already removed in the current version

2. **`src/expo-story/blocks/`** — remove any block files for these components (already removed)

<!-- HEROUI-NATIVE-PATCH-AGENTS-MD-END -->

## 8. Fix the input accent-color warning (Uniwind `accent-danger`)

The `Input` component passed `selectionColorClassName="accent-accent"` (+ `accent-danger` when
`isInvalid`) and `placeholderTextColorClassName="accent-field-placeholder"` to the text input.
Uniwind's accent extractor does not resolve those custom semantic tokens — it logs a one-time dev
warning (`className 'accent-danger' … no color was found`, fires on the FIRST input rendered in a
session) and the selection/placeholder colors silently fall back.

### Edit `src/components/input/input.tsx` and `lib/module/components/input/input.js`

1. Import `useThemeColor` alongside `useIsOnSurface` (`src`: `'../../helpers/external/hooks'`,
   `lib`: `"../../helpers/external/hooks/index.js"`).
2. Rename the destructured `selectionColorClassName`/`placeholderColorClassName` to
   `_selectionColorClassName`/`_placeholderColorClassName` (kept out of `...restProps`, unused).
3. Replace the `inputClassNames.placeholderTextColor(...)`/`inputSelectionColor(...)` computation
   and the `placeholderTextColorClassName`/`selectionColorClassName` props with theme colors:

```tsx
const placeholderTextColor = useThemeColor("field-placeholder");
const selectionColor = useThemeColor(isInvalid ? "danger" : "accent");
// HeroTextInput: placeholderTextColor={placeholderTextColor} selectionColor={selectionColor}
```

`useThemeColor` resolves the DS theme's `--color-*` variables (same mechanism the checkbox/switch
use) — no warning, and the selection/placeholder colors are actually themed.
