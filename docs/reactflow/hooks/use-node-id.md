---
title: "useNodeId()"
description: "You can use this hook to get the id of the node it is used inside. It is useful if you need the node's id deeper in the render tree but don't want to manually drill down the id as a prop."
source: "https://reactflow.dev/api-reference/hooks/use-node-id"
---

# useNodeId()

[Source on Github](https://github.com/xyflow/xyflow/blob/v11/packages/core/src/contexts/NodeIdContext.ts/#L7) 

You can use this hook to get the id of the node it is used inside. It is useful if you need the node’s id deeper in the render tree but don’t want to manually drill down the id as a prop.

```tsx
import { useNodeId } from "@xyflow/react";

export default function CustomNode() {
  return (
    <div>
      <span>This node has an id of </span>
      <NodeIdDisplay />
    </div>
  );
}

function NodeIdDisplay() {
  const nodeId = useNodeId();

  return <span>{nodeId}</span>;
}
```

## Signature

**Parameters:**

This function does not accept any parameters.

**Returns:**

`string | null`

## Notes

- This hook should only be used within a custom node or its children.

Last updated on August 24, 2026

[

useNodeConnections()

](/api-reference/hooks/use-node-connections)[

useNodes()

](/api-reference/hooks/use-nodes)
