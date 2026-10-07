---
title: "EdgeProps"
description: "When you implement a custom edge it is wrapped in a component that enables some basic functionality. Your custom edge component receives the following props:"
source: "https://reactflow.dev/api-reference/types/edge-props"
---

# EdgeProps

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/edges.ts/#L100) 

When you implement a custom edge it is wrapped in a component that enables some basic functionality. The `EdgeProps` type takes a generic parameter to specify the type of edges you use in your application:

```tsx
type AppEdgeProps = EdgeProps<MyEdgeType>;
```

Your custom edge component receives the following props:

## Fields

| Name | Type | Default |
| ---- | ---- | ------- |

| `id` | `[EdgeType](/api-reference/types/edge)["id"]` Unique id of an edge. | |
| `type` | `[EdgeType](/api-reference/types/edge)["type"]` Type of edge defined in `edgeTypes`. | |
| `animated` | `[EdgeType](/api-reference/types/edge)["animated"]` | |
| `data` | `[EdgeType](/api-reference/types/edge)["data"]` Arbitrary data passed to an edge. | |
| `style` | `[EdgeType](/api-reference/types/edge)["style"]` | |
| `selected` | `[EdgeType](/api-reference/types/edge)["selected"]` | |
| `source` | `[EdgeType](/api-reference/types/edge)["source"]` Id of source node. | |
| `target` | `[EdgeType](/api-reference/types/edge)["target"]` Id of target node. | |
| `selectable` | `[EdgeType](/api-reference/types/edge)["selectable"]` | |
| `deletable` | `[EdgeType](/api-reference/types/edge)["deletable"]` | |
| `sourceX` | `number` | |
| `sourceY` | `number` | |
| `targetX` | `number` | |
| `targetY` | `number` | |
| `sourcePosition` | `[Position](/api-reference/types/position)` | |
| `targetPosition` | `[Position](/api-reference/types/position)` | |
| `label` | `[ReactNode](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/d7e13a7c7789d54cf8d601352517189e82baf502/types/react/index.d.ts#L264)` The label or custom element to render along the edge. This is commonly a text label or some custom controls. | |
| `labelStyle` | `[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)` Custom styles to apply to the label. | |
| `labelShowBg` | `boolean` | |
| `labelBgStyle` | `[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)` | |
| `labelBgPadding` | `[number, number]` | |
| `labelBgBorderRadius` | `number` | |
| `sourceHandleId` | `string \| null` | |
| `targetHandleId` | `string \| null` | |
| `markerStart` | `string` | |
| `markerEnd` | `string` | |
| `pathOptions` | `any` | |
| `interactionWidth` | `number` | |

Last updated on August 24, 2026

[

EdgeMouseHandler

](/api-reference/types/edge-mouse-handler)[

EdgeTypes

](/api-reference/types/edge-types)
