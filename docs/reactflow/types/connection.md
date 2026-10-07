---
title: "Connection"
description: "The Connection type is the basic minimal description of an Edge between two nodes. The addEdge util can be used to upgrade a Connection to an Edge."
source: "https://reactflow.dev/api-reference/types/connection"
---

# Connection

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/general.ts/#L29-L34) 

The `Connection` type is the basic minimal description of an [`Edge`](/api-reference/types/edge) between two nodes. The [`addEdge`](/api-reference/utils/add-edge) util can be used to upgrade a `Connection` to an [`Edge`](/api-reference/types/edge).

## Fields

| Name | Type | Default |
| ---- | ---- | ------- |

| `source` | `string` The id of the node this connection originates from. | |
| `target` | `string` The id of the node this connection terminates at. | |
| `sourceHandle` | `string \| null` When not `null`, the id of the handle on the source node that this connection originates from. | |
| `targetHandle` | `string \| null` When not `null`, the id of the handle on the target node that this connection terminates at. | |

Last updated on August 24, 2026

[

ColorMode

](/api-reference/types/color-mode)[

ConnectionLineComponent

](/api-reference/types/connection-line-component)
