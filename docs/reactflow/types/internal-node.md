---
title: "InternalNode"
description: "The InternalNode is an extension of the base Node type with additional properties React Flow uses internally for rendering."
source: "https://reactflow.dev/api-reference/types/internal-node"
---

# InternalNode

[Source on GitHub](https://github.com/xyflow/xyflow/blob/99985b52026cf4ac65a1033178cf8c2bea4e14fa/packages/system/src/types/nodes.ts#L68) 

The `InternalNode` type is identical to the base [`Node`](/api-reference/types/node) type but is extended with some additional properties used internally by React Flow. Some functions and callbacks that return nodes may return an `InternalNode`.

## Fields

| Name | Type | Default |
| ---- | ---- | ------- |

| `width` | `[NodeType](/api-reference/types/node)["width"]` | |
| `height` | `[NodeType](/api-reference/types/node)["height"]` | |
| `id` | `[NodeType](/api-reference/types/node)["id"]` Unique id of a node. | |
| `position` | `[NodeType](/api-reference/types/node)["position"]` Position of a node on the pane. | |
| `type` | `[NodeType](/api-reference/types/node)["type"]` Type of node defined in nodeTypes | |
| `data` | `[NodeType](/api-reference/types/node)["data"]` | |
| `sourcePosition` | `[NodeType](/api-reference/types/node)["sourcePosition"]` Only relevant for default, source, target nodeType. Controls source position. | |
| `targetPosition` | `[NodeType](/api-reference/types/node)["targetPosition"]` Only relevant for default, source, target nodeType. Controls target position. | |
| `hidden` | `[NodeType](/api-reference/types/node)["hidden"]` | |
| `selected` | `[NodeType](/api-reference/types/node)["selected"]` | |
| `dragging` | `[NodeType](/api-reference/types/node)["dragging"]` | |
| `draggable` | `[NodeType](/api-reference/types/node)["draggable"]` | |
| `selectable` | `[NodeType](/api-reference/types/node)["selectable"]` | |
| `connectable` | `[NodeType](/api-reference/types/node)["connectable"]` | |
| `deletable` | `[NodeType](/api-reference/types/node)["deletable"]` | |
| `dragHandle` | `[NodeType](/api-reference/types/node)["dragHandle"]` A class name that can be applied to elements inside the node that allows those elements to act as drag handles, letting the user drag the node by clicking and dragging on those elements. | |
| `initialWidth` | `[NodeType](/api-reference/types/node)["initialWidth"]` | |
| `initialHeight` | `[NodeType](/api-reference/types/node)["initialHeight"]` | |
| `parentId` | `[NodeType](/api-reference/types/node)["parentId"]` | |
| `zIndex` | `[NodeType](/api-reference/types/node)["zIndex"]` | |
| `extent` | `[NodeType](/api-reference/types/node)["extent"]` Boundary a node can be moved in. | |
| `expandParent` | `[NodeType](/api-reference/types/node)["expandParent"]` When `true`, the parent node will automatically expand if this node is dragged to the edge of the parent node’s bounds. | |
| `ariaLabel` | `[NodeType](/api-reference/types/node)["ariaLabel"]` | |
| `origin` | `[NodeType](/api-reference/types/node)["origin"]` Origin of the node relative to its position. | |
| `handles` | `[NodeType](/api-reference/types/node)["handles"]` | |
| `measured` | `{ width?: number; height?: number; }` | |
| `internals` | `{ positionAbsolute: [XYPosition](/api-reference/types/xy-position); z: number; rootParentIndex?: number; userNode: [NodeType](/api-reference/types/node); handleBounds?: NodeHandleBounds; bounds?: NodeBounds; }` | |

Last updated on August 24, 2026

[

HandleConnection

](/api-reference/types/handle-connection)[

IsValidConnection

](/api-reference/types/is-valid-connection)
