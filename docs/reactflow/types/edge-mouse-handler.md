---
title: "EdgeMouseHandler"
description: "The EdgeMouseHandler type defines the callback function that is called when mouse events occur on an edge."
source: "https://reactflow.dev/api-reference/types/edge-mouse-handler"
---

# EdgeMouseHandler

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/edges.ts#L81) 

The `EdgeMouseHandler` type defines the callback function that is called when mouse events occur on an edge. This callback receives the event and the edge that triggered it.

```tsx
type EdgeMouseHandler = (event: React.MouseEvent, edge: Edge) => void;
```

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `event` | `[MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)<Element, [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)>` | |
| `edge` | `[EdgeType](/api-reference/types/edge)` | |

**Returns:**

`void`

Last updated on August 24, 2026

[

EdgeMarker

](/api-reference/types/edge-marker)[

EdgeProps

](/api-reference/types/edge-props)
