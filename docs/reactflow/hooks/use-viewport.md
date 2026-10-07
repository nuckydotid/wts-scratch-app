---
title: "useViewport()"
description: "The useViewport hook is a convenient way to read the current state of the Viewport in a component. Components that use this hook will re-render whenever the viewport changes."
source: "https://reactflow.dev/api-reference/hooks/use-viewport"
---

# useViewport()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useViewport.ts) 

The `useViewport` hook is a convenient way to read the current state of the [`Viewport`](/api-reference/types/viewport) in a component. Components that use this hook will re-render **whenever the viewport changes**.

```tsx
import { useViewport } from "@xyflow/react";

export default function ViewportDisplay() {
  const { x, y, zoom } = useViewport();

  return (
    <div>
      <p>
        The viewport is currently at ({x}, {y}) and zoomed to {zoom}.
      </p>
    </div>
  );
}
```

## Signature

**Parameters:**

This function does not accept any parameters.

**Returns:**

| Name | Type |
| ---- | ---- |

| `x` | `number` |
| `y` | `number` |
| `zoom` | `number` |

## Notes

- This hook can only be used in a component that is a child of a [`<ReactFlowProvider />`](/api-reference/react-flow-provider) or a [`<ReactFlow />`](/api-reference/react-flow) component.

Last updated on August 24, 2026

[

useUpdateNodeInternals()

](/api-reference/hooks/use-update-node-internals)[Types](/api-reference/types "Types")
