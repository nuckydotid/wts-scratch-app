---
title: "isEdge()"
description: "Test whether an object is usable as an Edge. In TypeScript this is a type guard that will narrow the type of whatever you pass in to Edge if it returns true."
source: "https://reactflow.dev/api-reference/utils/is-edge"
---

# isEdge()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/graph.ts/#L39-L40) 

Test whether an object is usable as an [`Edge`](/api-reference/types/edge). In TypeScript this is a type guard that will narrow the type of whatever you pass in to [`Edge`](/api-reference/types/edge) if it returns `true`.

```tsx
import { isEdge } from "@xyflow/react";

const edge = {
  id: "edge-a",
  source: "a",
  target: "b",
};

if (isEdge(edge)) {
  // ...
}
```

## Signature

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `element` | `unknown` The element to test | |

**Returns:**

`boolean`

Last updated on August 24, 2026

[

getViewportForBounds()

](/api-reference/utils/get-viewport-for-bounds)[

isNode()

](/api-reference/utils/is-node)
