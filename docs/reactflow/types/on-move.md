---
title: "OnMove"
description: "Invoked when the viewport is moved, such as by panning or zooming."
source: "https://reactflow.dev/api-reference/types/on-move"
---

# OnMove

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/general.ts#L16) 

The `OnMove` type is a callback that fires whenever the viewport is moved, either by user interaction or programmatically. It receives the triggering event and the new viewport state.

```tsx
type OnMove = (
  event: MouseEvent | TouchEvent | null,
  viewport: Viewport,
) => void;
```

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `event` | `[MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6) \| TouchEvent` | |
| `viewport` | `[Viewport](/api-reference/types/viewport)` | |

**Returns:**

`void`

Last updated on August 24, 2026

[

OnInit

](/api-reference/types/on-init)[

OnNodeDrag

](/api-reference/types/on-node-drag)
