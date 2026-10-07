---
title: "isNode()"
description: "Test whether an object is usable as a Node. In TypeScript this is a type guard that will narrow the type of whatever you pass in to Node if it returns true."
source: "https://reactflow.dev/api-reference/utils/is-node"
---

# isNode()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/graph.ts/#L49) 

Test whether an object is usable as a [`Node`](/api-reference/types/node). In TypeScript this is a type guard that will narrow the type of whatever you pass in to [`Node`](/api-reference/types/node) if it returns `true`.

```tsx
import { isNode } from "@xyflow/react";

const node = {
  id: "node-a",
  data: {
    label: "node",
  },
  position: {
    x: 0,
    y: 0,
  },
};

if (isNode(node)) {
  // ..
}
```

## Signature

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `element` | `unknown` The element to test. | |

**Returns:**

`boolean`

Last updated on August 24, 2026

[

isEdge()

](/api-reference/utils/is-edge)[

reconnectEdge()

](/api-reference/utils/reconnect-edge)
