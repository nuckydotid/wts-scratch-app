# Input & Textarea

> Form input fields supporting labels, helper text, error messages, and start/end content adornments.

## Import & Usage

```tsx
import { Input } from "@repo/worktrees-studio-ds";

<Input
  label="Email"
  placeholder="Enter your email"
  isInvalid={hasError}
  errorMessage="Invalid email"
/>;
```

## Design Tokens & Styling

- Styled exclusively via Tailwind CSS v4 classes and HeroUI Native tokens.
- Fully supports automatic Dark Mode switching.
- Enforces proper `testID` and accessibility attributes (`aria-label`, `aria-hidden`).

## Anti-Patterns

- ❌ Do not apply inline `style={{ ... }}` overrides.
- ❌ Do not hardcode hex color strings.
