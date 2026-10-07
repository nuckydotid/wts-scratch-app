---
title: "OnSelectionChangeFunc"
description: "Called whenever the selection of nodes or edges changes in the flow diagram."
source: "https://reactflow.dev/api-reference/types/on-selection-change-func"
---

# OnSelectionChangeFunc

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/general.ts#98) 

The `OnSelectionChangeFunc` type is a callback that is triggered when the selection of nodes or edges changes. It receives an object containing the currently selected nodes and edges.

```tsx
type OnSelectionChangeFunc = (params: { nodes: Node[]; edges: Edge[] }) => void;
```

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `params` | `OnSelectionChangeParams<[NodeType](/api-reference/types/node), [EdgeType](/api-reference/types/edge)>` | |

**Returns:**

`void`

Last updated on August 24, 2026

[

OnReconnect

](/api-reference/types/on-reconnect)[

PanOnScrollMode

](/api-reference/types/pan-on-scroll-mode)
