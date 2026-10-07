# Select, Dropdown & Menu

> Selection menus and dropdown primitives with accessible keyboard and gesture navigation.

## Import & Usage

```tsx
import { Select, SelectItem } from "@repo/worktrees-studio-ds";

<Select label="Select Grade">
  <SelectItem key="k1">Option 1</SelectItem>
  <SelectItem key="k2">Option 2</SelectItem>
</Select>;
```

## Design Tokens & Styling

- Styled exclusively via Tailwind CSS v4 classes and HeroUI Native tokens.
- Fully supports automatic Dark Mode switching.
- Enforces proper `testID` and accessibility attributes (`aria-label`, `aria-hidden`).

## Anti-Patterns

- ❌ Do not apply inline `style={{ ... }}` overrides.
- ❌ Do not hardcode hex color strings.
