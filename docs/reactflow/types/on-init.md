---
title: "OnInit"
description: "The OnInit type defines the callback function that is called when the ReactFlow instance is initialized."
source: "https://reactflow.dev/api-reference/types/on-init"
---

# OnInit

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/general.ts#L113) 

The `OnInit` type defines the callback function that is called when the ReactFlow instance is initialized. This callback receives the ReactFlow instance as its argument.

```tsx
type OnInit = (reactFlowInstance: ReactFlowInstance) => void;
```

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `reactFlowInstance` | `[ReactFlowInstance](/api-reference/types/react-flow-instance)<[NodeType](/api-reference/types/node), [EdgeType](/api-reference/types/edge)>` | |

**Returns:**

`void`

Last updated on August 24, 2026

[

OnError

](/api-reference/types/on-error)[

OnMove

](/api-reference/types/on-move)
