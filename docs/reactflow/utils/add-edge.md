---
title: "addEdge()"
description: "This util is a convenience function to add a new Edge to an array of edges. It also performs some validation to make sure you don't add an invalid edge or duplicate an existing one."
source: "https://reactflow.dev/api-reference/utils/add-edge"
---

# addEdge()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/edges/general.ts/#L100) 

This util is a convenience function to add a new [`Edge`](/api-reference/types/edge) to an array of edges. It also performs some validation to make sure you don’t add an invalid edge or duplicate an existing one.

```tsx
import { useCallback } from "react";
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";

export default function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback(
    (connection) => {
      setEdges((oldEdges) => addEdge(connection, oldEdges));
    },
    [setEdges],
  );

  return <ReactFlow nodes={nodes} edges={edges} onConnect={onConnect} />;
}
```

## Signature

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `edgeParams` | `[EdgeType](/api-reference/types/edge) \| [Connection](/api-reference/types/connection)` | |
| `edges` | `[EdgeType](/api-reference/types/edge)[]` | |
| `options.getEdgeId` | `GetEdgeId` Custom function to generate edge IDs. If not provided, the default `getEdgeId` function is used. | |
| `options.onError` | `[OnError](/api-reference/types/on-error)` Called when edge validation fails. If not provided, a default dev warning is used. | |

**Returns:**

`[EdgeType](/api-reference/types/edge)[]`

## Notes

- If an edge with the same `target` and `source` already exists (and the same `targetHandle` and `sourceHandle` if those are set), then this util won’t add a new edge even if the `id` property is different.

Last updated on August 24, 2026

[Utils](/api-reference/utils "Utils")[

applyEdgeChanges()

](/api-reference/utils/apply-edge-changes)
