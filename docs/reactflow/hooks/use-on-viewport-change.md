---
title: "useOnViewportChange()"
description: "The useOnViewportChange hook lets you listen for changes to the viewport such as panning and zooming. You can provide a callback for each phase of a viewport change: onStart, onChange, and onEnd."
source: "https://reactflow.dev/api-reference/hooks/use-on-viewport-change"
---

# useOnViewportChange()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useOnViewportChange.ts) 

The `useOnViewportChange` hook lets you listen for changes to the viewport such as panning and zooming. You can provide a callback for each phase of a viewport change: `onStart`, `onChange`, and `onEnd`.

```tsx
import { useCallback } from "react";
import { useOnViewportChange } from "@xyflow/react";

function ViewportChangeLogger() {
  useOnViewportChange({
    onStart: (viewport: Viewport) => console.log("start", viewport),
    onChange: (viewport: Viewport) => console.log("change", viewport),
    onEnd: (viewport: Viewport) => console.log("end", viewport),
  });

  return null;
}
```

## Signature

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `[0].onStart` | `OnViewportChange` Gets called when the viewport starts changing. | |
| `[0].onChange` | `OnViewportChange` Gets called when the viewport changes. | |
| `[0].onEnd` | `OnViewportChange` Gets called when the viewport stops changing. | |

**Returns:**

`void`

## Notes

- This hook can only be used in a component that is a child of a [`<ReactFlowProvider />`](/api-reference/react-flow-provider) or a [`<ReactFlow />`](/api-reference/react-flow) component.

Last updated on August 24, 2026

[

useOnSelectionChange()

](/api-reference/hooks/use-on-selection-change)[

useReactFlow()

](/api-reference/hooks/use-react-flow)
