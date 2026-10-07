---
title: "getOutgoers()"
description: "This util is used to tell you what nodes, if any, are connected to the given node as the target of an edge."
source: "https://reactflow.dev/api-reference/utils/get-outgoers"
---

# getOutgoers()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/graph.ts/#L64) 

This util is used to tell you what nodes, if any, are connected to the given node as the _target_ of an edge.

```tsx
import { getOutgoers } from "@xyflow/react";

const nodes = [];
const edges = [];

const outgoers = getOutgoers(
  { id: "1", position: { x: 0, y: 0 }, data: { label: "node" } },
  nodes,
  edges,
);
```

## Signature

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `node` | `[NodeType](/api-reference/types/node) \| { id: string; }` The node to get the connected nodes from. | |
| `nodes` | `[NodeType](/api-reference/types/node)[]` The array of all nodes. | |
| `edges` | `[EdgeType](/api-reference/types/edge)[]` The array of all edges. | |

**Returns:**

`[NodeType](/api-reference/types/node)[]`

Last updated on August 24, 2026

[

getNodesBounds()

](/api-reference/utils/get-nodes-bounds)[

getSimpleBezierPath()

](/api-reference/utils/get-simple-bezier-path)
