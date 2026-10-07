---
title: "Node"
description: "The Node type represents everything React Flow needs to know about a given node. Many of these properties can be manipulated both by React Flow or by you, but some such as width and height should be considered read-only."
source: "https://reactflow.dev/api-reference/types/node"
---

# Node

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/nodes.ts/#L10) 

The `Node` type represents everything React Flow needs to know about a given node. Many of these properties can be manipulated both by React Flow or by you, but some such as `width` and `height` should be considered read-only.

## Fields

| Name | Type | Default |
| ---- | ---- | ------- |

| `id` | `string` Unique id of a node. | |
| `position` | `[XYPosition](/api-reference/types/xy-position)` Position of a node on the pane. | |
| `data` | `NodeData` Arbitrary data passed to a node. | |
| `sourcePosition` | `[Position](/api-reference/types/position)` Only relevant for default, source, target nodeType. Controls source position. | |
| `targetPosition` | `[Position](/api-reference/types/position)` Only relevant for default, source, target nodeType. Controls target position. | |
| `hidden` | `boolean` Whether or not the node should be visible on the canvas. | |
| `selected` | `boolean` | |
| `dragging` | `boolean` Whether or not the node is currently being dragged. | |
| `draggable` | `boolean` Whether or not the node is able to be dragged. | |
| `selectable` | `boolean` | |
| `connectable` | `boolean` | |
| `deletable` | `boolean` | |
| `dragHandle` | `string` A class name that can be applied to elements inside the node that allows those elements to act as drag handles, letting the user drag the node by clicking and dragging on those elements. | |
| `width` | `number` | |
| `height` | `number` | |
| `initialWidth` | `number` | |
| `initialHeight` | `number` | |
| `parentId` | `string` Parent node id, used for creating sub-flows. | |
| `zIndex` | `number` | |
| `extent` | `[CoordinateExtent](/api-reference/types/coordinate-extent) \| "parent" \| null` Boundary a node can be moved in. | |
| `expandParent` | `boolean` When `true`, the parent node will automatically expand if this node is dragged to the edge of the parent node’s bounds. | |
| `ariaLabel` | `string` | |
| `origin` | `[NodeOrigin](/api-reference/types/node-origin)` Origin of the node relative to its position. | |
| `handles` | `[NodeHandle](/api-reference/types/node-handle)[]` | |
| `measured` | `{ width?: number; height?: number; }` | |
| `type` | `string \| [NodeType](/api-reference/types/node) \| ([NodeType](/api-reference/types/node) & undefined)` Type of node defined in nodeTypes | |
| `style` | `[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)` | |
| `className` | `string` | |
| `resizing` | `boolean` | |
| `focusable` | `boolean` | |
| `ariaRole` | `AriaRole` The ARIA role attribute for the node element, used for accessibility. | `"group"` |
| `domAttributes` | `Omit<HTMLAttributes<HTMLDivElement>, "id" \| "draggable" \| "style" \| "className" \| "role" \| "aria-label" \| "defaultValue" \| keyof DOMAttributes<HTMLDivElement>>` General escape hatch for adding custom attributes to the node’s DOM element. | |

## Default node types

You can create any of React Flow’s default nodes by setting the `type` property to one of the following values:

- `"default"`
- `"input"`
- `"output"`
- `"group"`

If you don’t set the `type` property at all, React Flow will fallback to the `"default"` node with both an input and output port.

These default nodes are available even if you set the [`nodeTypes`](/api-reference/react-flow#node-types) prop to something else, unless you override any of these keys directly.

## Notes

- You shouldn’t try to set the `width` or `height` of a node directly. It is calculated internally by React Flow and used when rendering the node in the viewport. To control a node’s size you should use the `style` or `className` props to apply CSS styles instead.

Last updated on August 24, 2026

[

MiniMapNodeProps

](/api-reference/types/mini-map-node-props)[

NodeChange

](/api-reference/types/node-change)
