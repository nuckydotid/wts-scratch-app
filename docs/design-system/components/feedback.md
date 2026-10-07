# Alert, Progress, Skeleton & Spinner

> Loading states, inline alerts, progress indicators, and skeleton placeholders.

## Import & Usage

```tsx
import { Alert, Spinner, Progress, Skeleton } from "@repo/worktrees-studio-ds";

<Alert
  color="warning"
  title="Payment Due"
  description="Tuition fee due next week."
/>;
```

## Design Tokens & Styling

- Styled exclusively via Tailwind CSS v4 classes and HeroUI Native tokens.
- Fully supports automatic Dark Mode switching.
- Enforces proper `testID` and accessibility attributes (`aria-label`, `aria-hidden`).

## Anti-Patterns

- ❌ Do not apply inline `style={{ ... }}` overrides.
- ❌ Do not hardcode hex color strings.
