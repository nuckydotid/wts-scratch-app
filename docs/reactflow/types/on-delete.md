---
title: "OnDelete"
description: "The OnDelete type defines the callback function that is called when nodes or edges are deleted."
source: "https://reactflow.dev/api-reference/types/on-delete"
---

# OnDelete

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/general.ts#L59) 

The `OnDelete` type defines the callback function that is called when nodes or edges are deleted. This callback receives an object containing the deleted nodes and edges.

```tsx
type OnDelete = (params: { nodes: Node[]; edges: Edge[] }) => void;
```

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `params` | `{ nodes: [NodeType](/api-reference/types/node)[]; edges: [EdgeType](/api-reference/types/edge)[]; }` | |

**Returns:**

`void`

Last updated on August 24, 2026

[

OnConnectStart

](/api-reference/types/on-connect-start)[

OnEdgesChange

](/api-reference/types/on-edges-change)
