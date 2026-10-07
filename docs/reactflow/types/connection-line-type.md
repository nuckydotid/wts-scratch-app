---
title: "ConnectionLineType"
description: "If you set the connectionLineType prop on your ReactFlow component, it will dictate the style of connection line rendered when creating new edges."
source: "https://reactflow.dev/api-reference/types/connection-line-type"
---

# ConnectionLineType

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/edges.ts/#L62) 

If you set the `connectionLineType` prop on your [`<ReactFlow />`](/api-reference/react-flow#connection-connectionLineType) component, it will dictate the style of connection line rendered when creating new edges.

```tsx
export enum ConnectionLineType {
  Bezier = "default",
  Straight = "straight",
  Step = "step",
  SmoothStep = "smoothstep",
  SimpleBezier = "simplebezier",
}
```

## Notes

- If you choose to render a custom connection line component, this value will be passed to your component as part of its [`ConnectionLineComponentProps`](/api-reference/types/connection-line-component-props).

Last updated on August 24, 2026

[

ConnectionLineComponentProps

](/api-reference/types/connection-line-component-props)[

ConnectionMode

](/api-reference/types/connection-mode)
