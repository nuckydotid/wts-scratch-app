---
title: "OnEdgesChange"
description: ""
source: "https://reactflow.dev/api-reference/types/on-edges-change"
---

# OnEdgesChange

This type is used for typing the [`onEdgesChange`](/api-reference/react-flow#on-edges-change) function.

```tsx
export type OnEdgesChange<EdgeType extends Edge = Edge> = (
  changes: EdgeChange<EdgeType>[],
) => void;
```

## Fields

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `changes` | `[EdgeChange](/api-reference/types/edge-change)<[EdgeType](/api-reference/types/edge)>[]` | |

**Returns:**

`void`

## Usage

This type accepts a generic type argument of custom edge types. See this [section in our Typescript guide](/learn/advanced-use/typescript#nodetype-edgetype-unions) for more information.

```tsx
const onEdgesChange: OnEdgesChange = useCallback(
  (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
  [setEdges],
);
```

Last updated on August 24, 2026

[

OnDelete

](/api-reference/types/on-delete)[

OnEdgesDelete

](/api-reference/types/on-edges-delete)
