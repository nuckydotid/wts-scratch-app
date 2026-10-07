---
title: "useNodeConnections()"
description: "This hook returns an array of connected edges. Components that use this hook will re-render whenever any edge changes."
source: "https://reactflow.dev/api-reference/hooks/use-node-connections"
---

# useNodeConnections()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useNodeConnections.ts) 

This hook returns an array of connections on a specific node, handle type (‘source’, ‘target’) or handle ID.

```tsx
import { useNodeConnections } from "@xyflow/react";

export default function () {
  const connections = useNodeConnections({
    handleType: "target",
    handleId: "my-handle",
  });

  return (
    <div>There are currently {connections.length} incoming connections!</div>
  );
}
```

## Signature

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `__0` | `UseNodeConnectionsParams` | |

**Returns:**

`[NodeConnection](/api-reference/types/node-connection)[]`

Last updated on August 24, 2026

[

useKeyPress()

](/api-reference/hooks/use-key-press)[

useNodeId()

](/api-reference/hooks/use-node-id)
