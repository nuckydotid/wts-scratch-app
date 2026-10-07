---
title: "ConnectionLineComponentProps"
description: "If you want to render a custom component for connection lines, you can set the connectionLineComponent prop on the ReactFlow component. The ConnectionLineComponentProps are passed to your custom component."
source: "https://reactflow.dev/api-reference/types/connection-line-component-props"
---

# ConnectionLineComponentProps

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/edges.ts/#L193) 

If you want to render a custom component for connection lines, you can set the `connectionLineComponent` prop on the [`<ReactFlow />`](/api-reference/react-flow#connection-connectionLineComponent) component. The `ConnectionLineComponentProps` are passed to your custom component.

## Props

| Name | Type | Default |
| ---- | ---- | ------- |

| `connectionLineStyle` | `[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)` | |
| `connectionLineType` | `[ConnectionLineType](/api-reference/types/connection-line-type)` | |
| `fromNode` | `[InternalNode](/api-reference/types/internal-node)<[NodeType](/api-reference/types/node)>` The node the connection line originates from. | |
| `fromHandle` | `[Handle](/api-reference/types/handle)` The handle on the `fromNode` that the connection line originates from. | |
| `fromX` | `number` | |
| `fromY` | `number` | |
| `toX` | `number` | |
| `toY` | `number` | |
| `fromPosition` | `[Position](/api-reference/types/position)` | |
| `toPosition` | `[Position](/api-reference/types/position)` | |
| `connectionStatus` | `"valid" \| "invalid" \| null` If there is an `isValidConnection` callback, this prop will be set to `"valid"` or `"invalid"` based on the return value of that callback. Otherwise, it will be `null`. | |
| `toNode` | `[InternalNode](/api-reference/types/internal-node)<[NodeType](/api-reference/types/node)> \| null` | |
| `toHandle` | `[Handle](/api-reference/types/handle) \| null` | |
| `pointer` | `[XYPosition](/api-reference/types/xy-position)` | |

Last updated on August 24, 2026

[

ConnectionLineComponent

](/api-reference/types/connection-line-component)[

ConnectionLineType

](/api-reference/types/connection-line-type)
