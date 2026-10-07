# Avatar, Badge & User

> Visual identity components for student/parent avatars, status badges, and user summary blocks.

## Import & Usage

```tsx
import { Avatar, Badge, User } from "@repo/worktrees-studio-ds";

<Badge content="5" color="danger">
  <Avatar src="https://i.pravatar.cc/150" size="md" />
</Badge>;
```

## Design Tokens & Styling

- Styled exclusively via Tailwind CSS v4 classes and HeroUI Native tokens.
- Fully supports automatic Dark Mode switching.
- Enforces proper `testID` and accessibility attributes (`aria-label`, `aria-hidden`).

## Anti-Patterns

- ❌ Do not apply inline `style={{ ... }}` overrides.
- ❌ Do not hardcode hex color strings.
