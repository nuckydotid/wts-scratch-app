# Design System Reference (@repo/worktrees-studio-ds)

Welcome to the Worktrees Studio Design System documentation. Built on top of **HeroUI Native** and **Tailwind CSS v4** with native Expo DOM components for charting.

## 📁 Modular Component Reference (Progressive Disclosure)

- [Button & ButtonGroup](components/button.md)
- [Card & Surface Primitives](components/card.md)
- [Input & Textarea](components/input.md)
- [Dialog, Modal & Popover](components/dialog-modal.md)
- [Avatar, Badge & User](components/avatar-badge.md)
- [Select, Dropdown & Menu](components/select-dropdown.md)
- [Alert, Progress & Skeleton](components/feedback.md)
- [Checkbox, Radio & Switch](components/selection-controls.md)
- [Recharts DOM Charts](components/charts-dom.md)

## 🎨 Theme & Tokens

- [Design Tokens Reference](tokens.md) — Color palette, semantic variables, typography scale, and radii.
- [HeroUI Patch Guide](patch-guide.md) — Patch notes for `heroui-native@1.0.7` integration with Tailwind v4.

## 🚫 Critical Anti-Patterns

- Never inject inline CSS or raw React Native `StyleSheet` objects.
- Always use theme tokens from `@repo/worktrees-studio-ds` and Tailwind v4 utility classes.
- All exported components must be barrel-exported through `packages/worktrees-studio-ds/src/index.ts`.
