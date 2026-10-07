---
title: "NodeMouseHandler"
description: "The NodeMouseHandler type defines the callback function that is called when mouse events occur on a node."
source: "https://reactflow.dev/api-reference/types/node-mouse-handler"
---

# NodeMouseHandler

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/nodes.ts) 

The `NodeMouseHandler` type defines the callback function that is called when mouse events occur on a node. This callback receives the event and the node that triggered it.

```tsx
export type NodeMouseHandler = (event: React.MouseEvent, node: Node) => void;
```

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `event` | `[MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)<Element, [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)>` | |
| `node` | `[NodeType](/api-reference/types/node)` | |

**Returns:**

`void`

Last updated on August 24, 2026

[

NodeHandle

](/api-reference/types/node-handle)[

NodeOrigin

](/api-reference/types/node-origin)
