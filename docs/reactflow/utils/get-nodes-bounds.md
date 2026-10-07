---
title: "getNodesBounds()"
description: "Returns the bounding box that contains all the given nodes in an array. This can be useful when combined with `getViewportForBounds` to calculate the correct transform to fit the given nodes in a viewport."
source: "https://reactflow.dev/api-reference/utils/get-nodes-bounds"
---

# getNodesBounds()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/graph.ts/#L133) 

Returns the bounding box that contains all the given nodes in an array. This can be useful when combined with [`getViewportForBounds`](/api-reference/utils/get-viewport-for-bounds) to calculate the correct transform to fit the given nodes in a viewport.

**Note**

This function was previously called `getRectOfNodes`

```tsx
import { getNodesBounds } from "@xyflow/react";

const nodes = [
  {
    id: "a",
    position: { x: 0, y: 0 },
    data: { label: "a" },
    width: 50,
    height: 25,
  },
  {
    id: "b",
    position: { x: 100, y: 100 },
    data: { label: "b" },
    width: 50,
    height: 25,
  },
];

const bounds = getNodesBounds(nodes);
```

## Signature

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `nodes` | `(string \| [NodeType](/api-reference/types/node) \| InternalNodeBase<[NodeType](/api-reference/types/node)>)[]` Nodes to calculate the bounds for. | |
| `params.nodeOrigin` | `[NodeOrigin](/api-reference/types/node-origin)` Origin of the nodes: `[0, 0]` for top-left, `[0.5, 0.5]` for center. | `[0, 0]` |
| `params.nodeLookup` | `NodeLookup<InternalNodeBase<[NodeType](/api-reference/types/node)>>` | |

**Returns:**

`[Rect](/api-reference/types/rect)`

Last updated on August 24, 2026

[

getIncomers()

](/api-reference/utils/get-incomers)[

getOutgoers()

](/api-reference/utils/get-outgoers)
