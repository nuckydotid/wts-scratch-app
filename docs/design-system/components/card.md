# Card & Surface Primitives

> Card container with Header, Body, and Footer subcomponents for structured content presentation.

## Import & Usage

```tsx
import { Card, CardHeader, CardBody, CardFooter } from "@repo/worktrees-studio-ds";

<Card className="p-4">
  <CardHeader>
    <Text className="font-bold">Card Title</Text>
  </CardHeader>
  <CardBody>
    <Text>Body content goes here.</Text>
  </CardBody>
</Card>;
```

## Design Tokens & Styling

- Styled exclusively via Tailwind CSS v4 classes and HeroUI Native tokens.
- Fully supports automatic Dark Mode switching.
- Enforces proper `testID` and accessibility attributes (`aria-label`, `aria-hidden`).

## Anti-Patterns

- ❌ Do not apply inline `style={{ ... }}` overrides.
- ❌ Do not hardcode hex color strings.
