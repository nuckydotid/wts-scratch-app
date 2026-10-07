---
title: "useNodesInitialized()"
description: "This hook tells you whether all the nodes in a flow have been measured and given a width and height. When you add a node to the flow, this hook will return false and then true again once the node has been measured."
source: "https://reactflow.dev/api-reference/hooks/use-nodes-initialized"
---

# useNodesInitialized()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useNodesInitialized.ts) 

This hook tells you whether all the nodes in a flow have been measured and given a width and height. When you add a node to the flow, this hook will return `false` and then `true` again once the node has been measured.

```tsx
import { useReactFlow, useNodesInitialized } from "@xyflow/react";
import { useEffect, useState } from "react";

const options = {
  includeHiddenNodes: false,
};

export default function useLayout() {
  const { getNodes } = useReactFlow();
  const nodesInitialized = useNodesInitialized(options);
  const [layoutedNodes, setLayoutedNodes] = useState(getNodes());

  useEffect(() => {
    if (nodesInitialized) {
      setLayoutedNodes(yourLayoutingFunction(getNodes()));
    }
  }, [nodesInitialized]);

  return layoutedNodes;
}
```

## Signature

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `options.includeHiddenNodes` | `boolean` | `false` |

**Returns:**

`boolean`

## Notes

- This hook always returns `false` if the internal nodes array is empty.

Last updated on August 24, 2026

[

useNodesData()

](/api-reference/hooks/use-nodes-data)[

useNodesState()

](/api-reference/hooks/use-nodes-state)
