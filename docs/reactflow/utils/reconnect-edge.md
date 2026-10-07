---
title: "reconnectEdge()"
description: "A handy utility to reconnect an existing Edge with new properties. This searches your edge array for an edge with a matching id and updates its properties with the connection you provide."
source: "https://reactflow.dev/api-reference/utils/reconnect-edge"
---

# reconnectEdge()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/edges/general.ts) 

A handy utility to update an existing [`Edge`](/api-reference/types/edge) with new properties. This searches your edge array for an edge with a matching `id` and updates its properties with the connection you provide.

```tsx
const onReconnect = useCallback(
  (oldEdge: Edge, newConnection: Connection) =>
    setEdges((els) => reconnectEdge(oldEdge, newConnection, els)),
  [],
);
```

## Signature

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `oldEdge` | `[EdgeType](/api-reference/types/edge)` | |
| `newConnection.source` | `string` The id of the node this connection originates from. | |
| `newConnection.target` | `string` The id of the node this connection terminates at. | |
| `newConnection.sourceHandle` | `string \| null` When not `null`, the id of the handle on the source node that this connection originates from. | |
| `newConnection.targetHandle` | `string \| null` When not `null`, the id of the handle on the target node that this connection terminates at. | |
| `edges` | `[EdgeType](/api-reference/types/edge)[]` | |
| `options.shouldReplaceId` | `boolean` Should the id of the old edge be replaced with the new connection id. | `true` |
| `options.getEdgeId` | `GetEdgeId` Custom function to generate edge IDs. If not provided, the default `getEdgeId` function is used. | |
| `options.onError` | `[OnError](/api-reference/types/on-error)` Called when edge validation fails. If not provided, a default dev warning is used. | |

**Returns:**

`[EdgeType](/api-reference/types/edge)[]`

Last updated on August 24, 2026

[

isNode()

](/api-reference/utils/is-node)
