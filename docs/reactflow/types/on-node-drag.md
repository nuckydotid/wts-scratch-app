---
title: "OnNodeDrag"
description: "The OnNodeDrag type defines the callback function that is called when a node is being dragged."
source: "https://reactflow.dev/api-reference/types/on-node-drag"
---

# OnNodeDrag

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/nodes.ts#L34) 

The `OnNodeDrag` type defines the callback function that is called when a node is being dragged. This callback receives the event and the node that is being dragged.

```tsx
type OnNodeDrag = (event: React.MouseEvent, node: Node) => void;
```

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `event` | `[MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6) \| TouchEvent` | |
| `node` | `[NodeType](/api-reference/types/node)` | |
| `nodes` | `[NodeType](/api-reference/types/node)[]` | |

**Returns:**

`void`

Last updated on August 24, 2026

[

OnMove

](/api-reference/types/on-move)[

OnNodesChange

](/api-reference/types/on-nodes-change)
