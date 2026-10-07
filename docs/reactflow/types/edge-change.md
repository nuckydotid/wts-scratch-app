---
title: "EdgeChange"
description: "The onEdgesChange callback takes an array of EdgeChange objects that you should use to update your flow's state. The EdgeChange type is a union of four different object types that represent that various ways an edge can change in a flow."
source: "https://reactflow.dev/api-reference/types/edge-change"
---

# EdgeChange

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/changes.ts/#L68-L72) 

The [`onEdgesChange`](/api-reference/react-flow#on-edges-change) callback takes an array of `EdgeChange` objects that you should use to update your flow’s state. The `EdgeChange` type is a union of four different object types that represent that various ways an edge can change in a flow.

```tsx
export type EdgeChange =
  EdgeAddChange | EdgeRemoveChange | EdgeReplaceChange | EdgeSelectionChange;
```

## Variants

### EdgeAddChange

| Name | Type | Default |
| ---- | ---- | ------- |

| `item` | `[EdgeType](/api-reference/types/edge)` | |
| `type` | `"add"` | |
| `index` | `number` | |

### EdgeRemoveChange

| Name | Type | Default |
| ---- | ---- | ------- |

| `id` | `string` | |
| `type` | `"remove"` | |

### EdgeReplaceChange

| Name | Type | Default |
| ---- | ---- | ------- |

| `id` | `string` | |
| `item` | `[EdgeType](/api-reference/types/edge)` | |
| `type` | `"replace"` | |

### EdgeSelectionChange

| Name | Type | Default |
| ---- | ---- | ------- |

| `id` | `string` | |
| `type` | `"select"` | |
| `selected` | `boolean` | |

Last updated on August 24, 2026

[

Edge

](/api-reference/types/edge)[

EdgeMarker

](/api-reference/types/edge-marker)
