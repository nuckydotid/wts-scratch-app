# Uniwind Usage Guide

Uniwind bridges Tailwind CSS v4 to React Native. This doc covers project-specific configuration, supported patterns, and critical rules for native compatibility.

## Reference

- Official docs: https://docs.uniwind.dev/llms.txt
- Class names: https://docs.uniwind.dev/class-names
- Theming: https://docs.uniwind.dev/theming/basics

## Config

worktrees-studio-ds uses `withUniwindConfig` in `metro.config.js`:

```js
const { withUniwindConfig } = require("uniwind/metro");
module.exports = withUniwindConfig(config, {
  cssEntryFile: "./src/global.css",
});
```

## Tailwind in React Native — Key Differences

From Uniwind docs — React Native uses the Yoga layout engine, not browser CSS:

- **No CSS cascade/inheritance** — styles don't inherit from parent components
- **Flexbox by default** — all views use `flexbox` with `flexDirection: "column"`
- **No em/rem/percentage in most properties** — use Tailwind spacing scale instead
- **No grid**, float, clear, columns, pseudo-elements (`::before`, `::after`)
- **State selectors**: `active:`, `disabled:`, `focus:` — but NOT `hover:`, `visited:`

## Platform Selectors

| Selector   | Targets            |
| ---------- | ------------------ |
| `ios:`     | iOS devices        |
| `android:` | Android devices    |
| `native:`  | Both iOS + Android |
| `web:`     | Web browsers       |

```tsx
<UiView className="native:bg-blue-500 web:bg-gray-500" />
```

## Safe Area Classes

Uniwind provides safe area utilities that resolve via `Uniwind.updateInsets()`:

- `pt-safe`, `pb-safe`, `pl-safe`, `pr-safe` — padding based on safe area insets
- `mt-safe`, `mb-safe` — margin based on safe area insets
- `top-safe`, `bottom-safe` — positioning based on safe area insets

Requires `SafeAreaListener` setup (already configured in `_layout.tsx`).

## Dark Mode

- `ScopedTheme` from `uniwind` wraps subtrees in light/dark/custom themes
- `ThemeProvider` in `src/components/providers/theme-provider.tsx` uses `ScopedTheme` internally
- On web: `.dark` class on `<html>` + Tailwind `dark:` variant
- The `@custom-variant dark (&:where(.dark, .dark *))` directive enables class-based dark mode on web

## CSS Variables in Inline Styles — CRITICAL RULE

CSS variables (`var(--xxx)`) work in Tailwind `className` via Uniwind's runtime resolver,
but **NOT in inline `style={{...}}` objects**. React Native does not resolve CSS variables.

```tsx
// ✅ WORKS — Uniwind resolves via className
<UiView className="bg-background text-foreground" />

// ❌ BROKEN on native — RN sees literal string "var(--background)"
<View style={{ backgroundColor: "var(--background)" }} />

// ❌ BROKEN on native — IonIcons color prop receives unresolvable string
<Ionicons color="var(--foreground)" />
```

### Fix: Use `useTheme()` hook for Ionicons colors

```tsx
import { useTheme } from "@/hooks/use-theme";

function MyComponent() {
  const { theme } = useTheme();
  const iconColor = theme === "dark" ? "#d4d4d8" : "#3f3f46";

  return <Ionicons name="menu" size={28} color={iconColor} />;
}
```

## Arbitrary Values

Tailwind arbitrary values (e.g. `text-[15px]`, `tracking-[8px]`, `min-w-[20px]`) are
supported by Uniwind on all platforms.

## Class Name Support

All standard Tailwind utility classes are supported:

- Layout: `flex`, `block`, `hidden`
- Spacing: `p-*`, `m-*`, `gap-*`
- Sizing: `w-*`, `h-*`, `min-w-*`, `max-w-*`
- Typography: `text-*`, `font-*`, `tracking-*`, `leading-*`
- Colors: `bg-*`, `text-*`, `border-*`
- Borders: `border-*`, `rounded-*`
- Flexbox: `justify-*`, `items-*`, `content-*`
- Positioning: `absolute`, `relative`, `top-*`, `left-*`
- Transforms: `translate-*`, `rotate-*`, `scale-*`
- State: `active:*`, `disabled:*`, `focus:*`
- Platform: `ios:*`, `android:*`, `native:*`, `web:*`
- Safe area: `p-safe`, `pt-safe`, `pb-safe`

## Unsupported Classes (web-only, no RN equivalent)

- `hover:*`, `visited:*`, `before:*`, `after:*`, `placeholder:*`
- `float-*`, `clear-*`, `columns-*`
- `print:*`, `screen:*` (media query variants)
