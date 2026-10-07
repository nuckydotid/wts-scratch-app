---
title: "IsValidConnection"
description: "Function type that determines whether a connection between nodes is valid."
source: "https://reactflow.dev/api-reference/types/is-valid-connection"
---

# IsValidConnection

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/general.ts#L212) 

The `IsValidConnection` type represents a function that validates whether a connection between nodes is allowed. It receives a [`Connection`](/api-reference/types/connection) and returns a boolean indicating whether the connection is valid and therefore should be created.

```tsx
type IsValidConnection = (edge: Edge | Connection) => boolean;
```

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `edge` | `[EdgeType](/api-reference/types/edge) \| [Connection](/api-reference/types/connection)` | |

**Returns:**

`boolean`

Last updated on August 24, 2026

[

InternalNode

](/api-reference/types/internal-node)[

KeyCode

](/api-reference/types/key-code)
