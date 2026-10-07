---
title: "OnBeforeDelete"
description: "The OnBeforeDelete type defines the callback function that is called before nodes or edges are deleted."
source: "https://reactflow.dev/api-reference/types/on-before-delete"
---

# OnBeforeDelete

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/general.ts#L207) 

The `OnBeforeDelete` type defines the callback function that is called before nodes or edges are deleted. This callback receives an object containing the nodes and edges that are about to be deleted.

```tsx
type OnBeforeDelete = (params: {
  nodes: Node[];
  edges: Edge[];
}) => Promise<boolean | {
  nodes: Node[];
  edges: Edge[];
})>;
```

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `__0` | `{ nodes: [NodeType](/api-reference/types/node)[]; edges: [EdgeType](/api-reference/types/edge)[]; }` | |

**Returns:**

`Promise<boolean | { nodes: [NodeType](/api-reference/types/node)[]; edges: [EdgeType](/api-reference/types/edge)[]; }>`

Last updated on August 24, 2026

[

NodeTypes

](/api-reference/types/node-types)[

OnConnect

](/api-reference/types/on-connect)
