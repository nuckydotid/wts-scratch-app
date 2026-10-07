---
title: "useInternalNode()"
description: "This hook returns an InternalNode object for the given node ID."
source: "https://reactflow.dev/api-reference/hooks/use-internal-node"
---

# useInternalNode()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useInternalNode.ts) 

This hook returns the internal representation of a specific node. Components that use this hook will re-render **whenever any node changes**, including when a node is selected or moved.

```tsx
import { useInternalNode } from "@xyflow/react";

export default function () {
  const internalNode = useInternalNode("node-1");
  const absolutePosition = internalNode.internals.positionAbsolute;

  return (
    <div>
      The absolute position of the node is at:
      <p>x: {absolutePosition.x}</p>
      <p>y: {absolutePosition.y}</p>
    </div>
  );
}
```

## Signature

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `id` | `string` The ID of a node you want to observe. | |

**Returns:**

`[InternalNode](/api-reference/types/internal-node)<[NodeType](/api-reference/types/node)> | undefined`

## TypeScript

This hook accepts a generic type argument of custom node types. See this [section in our TypeScript guide](/learn/advanced-use/typescript#nodetype-edgetype-unions) for more information.

```tsx
const internalNode = useInternalNode<CustomNodeType>();
```

Last updated on August 24, 2026

[

useHandleConnections()

](/api-reference/hooks/use-handle-connections)[

useKeyPress()

](/api-reference/hooks/use-key-press)
