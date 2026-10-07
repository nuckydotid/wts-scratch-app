---
title: "applyNodeChanges()"
description: "Various events on the ReactFlow component can produce a NodeChange that describes how to update the nodes of your flow in some way. If you don't need any custom behavior, this util can be used to take an array of these changes and apply them to your nodes."
source: "https://reactflow.dev/api-reference/utils/apply-node-changes"
---

# applyNodeChanges()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/utils/changes.ts/#L140) 

Various events on the [`<ReactFlow />`](/api-reference/react-flow) component can produce a [`NodeChange`](/api-reference/types/node-change) that describes how to update the nodes of your flow in some way. If you don’t need any custom behavior, this util can be used to take an array of these changes and apply them to your nodes.

```tsx
import { useState, useCallback } from "react";
import { ReactFlow, applyNodeChanges } from "@xyflow/react";

export default function Flow() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const onNodesChange = useCallback(
    (changes) => {
      setNodes((oldNodes) => applyNodeChanges(changes, oldNodes));
    },
    [setNodes],
  );

  return (
    <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} />
  );
}
```

## Signature

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `changes` | `[NodeChange](/api-reference/types/node-change)<[NodeType](/api-reference/types/node)>[]` Array of changes to apply. | |
| `nodes` | `[NodeType](/api-reference/types/node)[]` Array of nodes to apply the changes to. | |

**Returns:**

`[NodeType](/api-reference/types/node)[]`

## Notes

- If you don’t need any custom behavior, the [`useNodesState`](/api-reference/hooks/use-nodes-state) hook conveniently wraps this util and React’s `useState` hook for you and might be simpler to use.

Last updated on August 24, 2026

[

applyEdgeChanges()

](/api-reference/utils/apply-edge-changes)[

getBezierPath()

](/api-reference/utils/get-bezier-path)
