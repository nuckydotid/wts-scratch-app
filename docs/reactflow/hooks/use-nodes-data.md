---
title: "useNodesData()"
description: "With this hook you can subscribe to changes of a node data of a specific node."
source: "https://reactflow.dev/api-reference/hooks/use-nodes-data"
---

# useNodesData()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useNodesData.ts) 

This hook lets you subscribe to changes of a specific nodes `data` object.

```tsx
import { useNodesData } from "@xyflow/react";

export default function () {
  const nodeData = useNodesData("nodeId-1");

  const nodesData = useNodesData(["nodeId-1", "nodeId-2"]);
}
```

## Signature

Function Signature 1Function Signature 2

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `nodeId` | `string` The id of the node to get the data from. | |

**Returns:**

`DistributivePick<[NodeType](/api-reference/types/node), "id" | "type" | "data"> | null`

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `nodeIds` | `string[]` The ids of the nodes to get the data from. | |

**Returns:**

`DistributivePick<[NodeType](/api-reference/types/node), "id" | "type" | "data">[]`

## TypeScript

This hook accepts a generic type argument of custom node types. See this [section in our TypeScript guide](/learn/advanced-use/typescript#nodetype-edgetype-unions) for more information.

```tsx
const nodesData = useNodesData<NodesType>(["nodeId-1", "nodeId-2"]);
```

Last updated on August 24, 2026

[

useNodes()

](/api-reference/hooks/use-nodes)[

useNodesInitialized()

](/api-reference/hooks/use-nodes-initialized)
