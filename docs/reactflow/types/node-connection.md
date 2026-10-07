---
title: "NodeConnection"
description: "The NodeConnection type is a Connection that includes the edgeId."
source: "https://reactflow.dev/api-reference/types/node-connection"
---

# NodeConnection

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/general.ts/#L36-L37) 

The `NodeConnection` type is an extension of a basic [Connection](/api-reference/types/connection) that includes the `edgeId`.

## Fields

| Name | Type | Default |
| ---- | ---- | ------- |

| `source` | `string` The id of the node this connection originates from. | |
| `target` | `string` The id of the node this connection terminates at. | |
| `sourceHandle` | `string \| null` When not `null`, the id of the handle on the source node that this connection originates from. | |
| `targetHandle` | `string \| null` When not `null`, the id of the handle on the target node that this connection terminates at. | |
| `edgeId` | `string` | |

Last updated on August 24, 2026

[

NodeChange

](/api-reference/types/node-change)[

NodeHandle

](/api-reference/types/node-handle)
