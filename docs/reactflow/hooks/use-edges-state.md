---
title: "useEdgesState()"
description: "This hook makes it easy to prototype a controlled flow where you manage the state of nodes and edges outside the ReactFlowInstance. You can think of it like React's `useState` hook with an additional helper callback."
source: "https://reactflow.dev/api-reference/hooks/use-edges-state"
---

# useEdgesState()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useNodesEdgesState.ts) 

This hook makes it easy to prototype a controlled flow where you manage the state of nodes and edges outside the `ReactFlowInstance`. You can think of it like React’s `useState` hook with an additional helper callback.

```tsx
import { ReactFlow, useNodesState, useEdgesState } from "@xyflow/react";

const initialNodes = [];
const initialEdges = [];

export default function () {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
    />
  );
}
```

## Signature

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `initialEdges` | `[EdgeType](/api-reference/types/edge)[]` | |

**Returns:**

`[edges: [EdgeType](/api-reference/types/edge)[], setEdges: [Dispatch](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/bdd784f597ef151da8659762300621686969470d/types/react/v17/index.d.ts#L879)<[SetStateAction](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/bdd784f597ef151da8659762300621686969470d/types/react/v17/index.d.ts#L879)<[EdgeType](/api-reference/types/edge)[]>>, onEdgesChange: [OnEdgesChange](/api-reference/types/on-edges-change)<[EdgeType](/api-reference/types/edge)>]`

## TypeScript

This hook accepts a generic type argument of custom edge types. See this [section in our TypeScript guide](/learn/advanced-use/typescript#nodetype-edgetype-unions) for more information.

```tsx
const nodes = useEdgesState<CustomEdgeType>();
```

## Notes

- This hook was created to make prototyping easier and our documentation examples clearer. Although it is OK to use this hook in production, in practice you may want to use a more sophisticated state management solution like [Zustand](/docs/guides/state-management) instead.

Last updated on August 24, 2026

[

useEdges()

](/api-reference/hooks/use-edges)[

useHandleConnections()

](/api-reference/hooks/use-handle-connections)
