---
title: "OnReconnect"
description: "Callback function triggered when an existing edge is reconnected to a different node or handle."
source: "https://reactflow.dev/api-reference/types/on-reconnect"
---

# OnReconnect

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/general.ts#L83) 

The `OnReconnect` type represents a callback function that is called when an existing edge is reconnected to a different node or handle. It receives the old edge and the new connection details.

```tsx
type OnReconnect<EdgeType extends EdgeBase = EdgeBase> = (
  oldEdge: EdgeType,
  newConnection: Connection,
) => void;
```

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `oldEdge` | `[EdgeType](/api-reference/types/edge)` | |
| `newConnection` | `[Connection](/api-reference/types/connection)` | |

**Returns:**

`void`

Last updated on August 24, 2026

[

OnNodesDelete

](/api-reference/types/on-nodes-delete)[

OnSelectionChangeFunc

](/api-reference/types/on-selection-change-func)
