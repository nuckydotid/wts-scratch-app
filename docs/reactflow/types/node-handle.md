---
title: "NodeHandle"
description: "The NodeHandle type is used to define a handle for a node if server side rendering is used."
source: "https://reactflow.dev/api-reference/types/node-handle"
---

# NodeHandle

[Source on GitHub](https://github.com/xyflow/xyflow/blob/13897512d3c57e72c2e27b14ffa129412289d948/packages/system/src/types/nodes.ts#L139) 

The `NodeHandle` type is used to define a handle for a node if server-side rendering is used. On the server, React Flow can’t measure DOM nodes, so it’s necessary to define the handle position dimensions.

| Name | Type | Default |
| ---- | ---- | ------- |

| `width` | `number` | |
| `height` | `number` | |
| `id` | `string \| null` | |
| `x` | `number` | |
| `y` | `number` | |
| `position` | `[Position](/api-reference/types/position)` | |
| `type` | `'source' \| 'target'` | |

Last updated on August 24, 2026

[

NodeConnection

](/api-reference/types/node-connection)[

NodeMouseHandler

](/api-reference/types/node-mouse-handler)
