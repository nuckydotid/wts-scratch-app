---
title: "OnNodesDelete"
description: "The OnNodesDelete type defines the callback function that is called when nodes are deleted."
source: "https://reactflow.dev/api-reference/types/on-nodes-delete"
---

# OnNodesDelete

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/general.ts#L51) 

The `OnNodesDelete` type defines the callback function that is called when nodes are deleted. This callback receives an array of the deleted nodes.

```tsx
type OnNodesDelete = (nodes: Node[]) => void;
```

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `nodes` | `[NodeType](/api-reference/types/node)[]` | |

**Returns:**

`void`

Last updated on August 24, 2026

[

OnNodesChange

](/api-reference/types/on-nodes-change)[

OnReconnect

](/api-reference/types/on-reconnect)
