# Checkbox, Radio & Switch

> Boolean selection controls and radio groups with custom styling and animations.

## Import & Usage

```tsx
import { Switch, Checkbox, RadioGroup, Radio } from "@repo/worktrees-studio-ds";

<Switch defaultSelected aria-label="Notifications">
  Enable Notifications
</Switch>;
```

## Design Tokens & Styling

- Styled exclusively via Tailwind CSS v4 classes and HeroUI Native tokens.
- Fully supports automatic Dark Mode switching.
- Enforces proper `testID` and accessibility attributes (`aria-label`, `aria-hidden`).

## Anti-Patterns

- ❌ Do not apply inline `style={{ ... }}` overrides.
- ❌ Do not hardcode hex color strings.
