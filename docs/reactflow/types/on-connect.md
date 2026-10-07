---
title: "OnConnect"
description: "Callback function triggered when a new connection is created between nodes."
source: "https://reactflow.dev/api-reference/types/on-connect"
---

# OnConnect

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/general.ts#L80) 

The `OnConnect` type represents a callback function that is called when a new connection is created between nodes. It receives a [`Connection`](/api-reference/types/connection) containing the source and target node IDs and their respective handle IDs.

```tsx
type OnConnect = (connection: Connection) => void;
```

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `connection` | `[Connection](/api-reference/types/connection)` | |

**Returns:**

`void`

Last updated on August 24, 2026

[

OnBeforeDelete

](/api-reference/types/on-before-delete)[

OnConnectEnd

](/api-reference/types/on-connect-end)
