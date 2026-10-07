---
title: "useOnSelectionChange()"
description: "This hook lets you listen for changes to both node and edge selection. As the name implies, the callback you provide will be called whenever the selection of either nodes or edges changes."
source: "https://reactflow.dev/api-reference/hooks/use-on-selection-change"
---

# useOnSelectionChange()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useOnSelectionChange.ts) 

This hook lets you listen for changes to both node and edge selection. As the name implies, the callback you provide will be called whenever the selection of _either_ nodes or edges changes.

**Warning**

You need to memoize the passed `onChange` handler, otherwise the hook will not work correctly.

```tsx
import { useState } from "react";
import { ReactFlow, useOnSelectionChange } from "@xyflow/react";

function SelectionDisplay() {
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);

  // the passed handler has to be memoized, otherwise the hook will not work correctly
  const onChange = useCallback(({ nodes, edges }) => {
    setSelectedNodes(nodes.map((node) => node.id));
    setSelectedEdges(edges.map((edge) => edge.id));
  }, []);

  useOnSelectionChange({
    onChange,
  });

  return (
    <div>
      <p>Selected nodes: {selectedNodes.join(", ")}</p>
      <p>Selected edges: {selectedEdges.join(", ")}</p>
    </div>
  );
}
```

## Signature

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `[0].onChange` | `[OnSelectionChangeFunc](/api-reference/types/on-selection-change-func)<[NodeType](/api-reference/types/node), [EdgeType](/api-reference/types/edge)>` The handler to register. | |

**Returns:**

`void`

## Notes

- This hook can only be used in a component that is a child of a [`<ReactFlowProvider />`](/api-reference/react-flow-provider) or a [`<ReactFlow />`](/api-reference/react-flow) component.

Last updated on August 24, 2026

[

useNodesState()

](/api-reference/hooks/use-nodes-state)[

useOnViewportChange()

](/api-reference/hooks/use-on-viewport-change)
