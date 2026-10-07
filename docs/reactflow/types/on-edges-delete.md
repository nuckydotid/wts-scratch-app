---
title: "OnEdgesDelete"
description: "The OnEdgesDelete type defines the callback function that is called when edges are deleted."
source: "https://reactflow.dev/api-reference/types/on-edges-delete"
---

# OnEdgesDelete

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/general.ts#L52) 

The `OnEdgesDelete` type defines the callback function that is called when edges are deleted. This callback receives an array of the deleted edges.

```tsx
type OnEdgesDelete = (edges: Edge[]) => void;
```

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `edges` | `[EdgeType](/api-reference/types/edge)[]` | |

**Returns:**

`void`

Last updated on August 24, 2026

[

OnEdgesChange

](/api-reference/types/on-edges-change)[

OnError

](/api-reference/types/on-error)
