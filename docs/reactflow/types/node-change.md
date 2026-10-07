---
title: "NodeChange"
description: "The onNodesChange callback takes an array of NodeChange objects that you should use to update your flow's state. The NodeChange type is a union of six different object types that represent that various ways an node can change in a flow."
source: "https://reactflow.dev/api-reference/types/node-change"
---

# NodeChange

[Source on GitHub](https://github.com/xyflow/xyflow/blob/487b13c9ad8903789f56c6fcfd8222f9cb74b812/packages/system/src/types/changes.ts/#L47) 

The [`onNodesChange`](/api-reference/react-flow#on-nodes-change) callback takes an array of `NodeChange` objects that you should use to update your flow’s state. The `NodeChange` type is a union of six different object types that represent that various ways an node can change in a flow.

```tsx
export type NodeChange =
  | NodeDimensionChange
  | NodePositionChange
  | NodeSelectionChange
  | NodeRemoveChange
  | NodeAddChange
  | NodeReplaceChange;
```

## Variant types

### NodeDimensionChange

| Name | Type | Default |
| ---- | ---- | ------- |

| `id` | `string` | |
| `type` | `"dimensions"` | |
| `dimensions` | `Dimensions` | |
| `resizing` | `boolean` | |
| `setAttributes` | `boolean \| "width" \| "height"` | |

### NodePositionChange

| Name | Type | Default |
| ---- | ---- | ------- |

| `id` | `string` | |
| `type` | `"position"` | |
| `position` | `[XYPosition](/api-reference/types/xy-position)` | |
| `positionAbsolute` | `[XYPosition](/api-reference/types/xy-position)` | |
| `dragging` | `boolean` | |

### NodeSelectionChange

| Name | Type | Default |
| ---- | ---- | ------- |

| `id` | `string` | |
| `type` | `"select"` | |
| `selected` | `boolean` | |

### NodeRemoveChange

| Name | Type | Default |
| ---- | ---- | ------- |

| `id` | `string` | |
| `type` | `"remove"` | |

### NodeAddChange

| Name | Type | Default |
| ---- | ---- | ------- |

| `item` | `[NodeType](/api-reference/types/node)` | |
| `type` | `"add"` | |
| `index` | `number` | |

### NodeReplaceChange

| Name | Type | Default |
| ---- | ---- | ------- |

| `id` | `string` | |
| `item` | `[NodeType](/api-reference/types/node)` | |
| `type` | `"replace"` | |

Last updated on August 24, 2026

[

Node

](/api-reference/types/node)[

NodeConnection

](/api-reference/types/node-connection)
