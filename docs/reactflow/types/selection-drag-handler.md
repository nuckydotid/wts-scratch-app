---
title: "SelectionDragHandler"
description: "Handles drag events for selected nodes during interactive operations."
source: "https://reactflow.dev/api-reference/types/selection-drag-handler"
---

# SelectionDragHandler

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/nodes.ts#L33) 

The `SelectionDragHandler` type is a callback for handling drag events involving selected nodes. It receives the triggering mouse or touch event and an array of the affected nodes.

```tsx
type SelectionDragHandler<NodeType extends Node = Node> = (
  event: ReactMouseEvent,
  nodes: NodeType[],
) => void;
```

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `event` | `[MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)<Element, [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)>` | |
| `nodes` | `[NodeType](/api-reference/types/node)[]` | |

**Returns:**

`void`

Last updated on August 24, 2026

[

ResizeParams

](/api-reference/types/resize-params)[

SelectionMode

](/api-reference/types/selection-mode)
