---
title: "applyEdgeChanges()"
description: "Various events on the ReactFlow component can produce an EdgeChange that describes how to update the edges of your flow in some way. If you don't need any custom behavior, this util can be used to take an array of these changes and apply them to your edges."
source: "https://reactflow.dev/api-reference/utils/apply-edge-changes"
---

# applyEdgeChanges()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/utils/changes.ts/#L167) 

Various events on the [`<ReactFlow />`](/api-reference/react-flow) component can produce an [`EdgeChange`](/api-reference/types/edge-change) that describes how to update the edges of your flow in some way. If you don’t need any custom behavior, this util can be used to take an array of these changes and apply them to your edges.

```tsx
import { useState, useCallback } from "react";
import { ReactFlow, applyEdgeChanges } from "@xyflow/react";

export default function Flow() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((oldEdges) => applyEdgeChanges(changes, oldEdges));
    },
    [setEdges],
  );

  return (
    <ReactFlow nodes={nodes} edges={edges} onEdgesChange={onEdgesChange} />
  );
}
```

## Signature

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `changes` | `[EdgeChange](/api-reference/types/edge-change)<[EdgeType](/api-reference/types/edge)>[]` Array of changes to apply. | |
| `edges` | `[EdgeType](/api-reference/types/edge)[]` Array of edge to apply the changes to. | |

**Returns:**

`[EdgeType](/api-reference/types/edge)[]`

## Notes

- If you don’t need any custom behavior, the [`useEdgesState`](/api-reference/hooks/use-edges-state) hook conveniently wraps this util and React’s `useState` hook for you and might be simpler to use.

Last updated on August 24, 2026

[

addEdge()

](/api-reference/utils/add-edge)[

applyNodeChanges()

](/api-reference/utils/apply-node-changes)
