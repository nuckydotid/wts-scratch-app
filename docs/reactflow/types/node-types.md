---
title: "NodeTypes"
description: "The NodeTypes type is used to define custom node types."
source: "https://reactflow.dev/api-reference/types/node-types"
---

# NodeTypes

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/nodes.ts) 

The `NodeTypes` type is used to define custom node types. Each key in the object represents a node type, and the value is the component that should be rendered for that type.

```tsx
type NodeTypes = {
  [key: string]: React.ComponentType<NodeProps>;
};
```

Last updated on August 24, 2026

[

NodeProps

](/api-reference/types/node-props)[

OnBeforeDelete

](/api-reference/types/on-before-delete)
