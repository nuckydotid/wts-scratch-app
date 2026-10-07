# Button & ButtonGroup

> Interactive button components with variants, colors, sizes, and loading states.

## Import & Usage

```tsx
import { Button, ButtonGroup } from "@repo/worktrees-studio-ds";

<Button variant="solid" color="primary" onPress={handlePress}>
  Submit
</Button>;
```

## Design Tokens & Styling

- Styled exclusively via Tailwind CSS v4 classes and HeroUI Native tokens.
- Fully supports automatic Dark Mode switching.
- Enforces proper `testID` and accessibility attributes (`aria-label`, `aria-hidden`).

## Anti-Patterns

- ❌ Do not apply inline `style={{ ... }}` overrides.
- ❌ Do not hardcode hex color strings.
