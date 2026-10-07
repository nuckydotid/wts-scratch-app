# Dialog, Modal & Popover

> Accessible modal overlay and dialog primitives for confirmations, forms, and popups.

## Import & Usage

```tsx
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@repo/worktrees-studio-ds";

<Modal isOpen={isOpen} onClose={onClose}>
  <ModalContent>
    <ModalHeader>Modal Title</ModalHeader>
    <ModalBody>
      <Text>Modal content</Text>
    </ModalBody>
  </ModalContent>
</Modal>;
```

## Design Tokens & Styling

- Styled exclusively via Tailwind CSS v4 classes and HeroUI Native tokens.
- Fully supports automatic Dark Mode switching.
- Enforces proper `testID` and accessibility attributes (`aria-label`, `aria-hidden`).

## Anti-Patterns

- ❌ Do not apply inline `style={{ ... }}` overrides.
- ❌ Do not hardcode hex color strings.
