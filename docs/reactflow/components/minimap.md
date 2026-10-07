---
title: "<MiniMap />"
description: "The MiniMap component can be used to render an overview of your flow. It renders each node as an SVG element and visualizes where the current viewport is in relation to the rest of the flow."
source: "https://reactflow.dev/api-reference/components/minimap"
---

# <MiniMap />

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/additional-components/MiniMap/MiniMap.tsx) 

The `<MiniMap />` component can be used to render an overview of your flow. It renders each node as an SVG element and visualizes where the current viewport is in relation to the rest of the flow.

```tsx
import { ReactFlow, MiniMap } from '@xyflow/react';

export default function Flow() {
  return (
    <ReactFlow nodes={[...]]} edges={[...]]}>
      <MiniMap nodeStrokeWidth={3} />
    </ReactFlow>
  );
}
```

## Props

For TypeScript users, the props type for the `<MiniMap />` component is exported as `MiniMapProps`.

| Name | Type | Default |
| ---- | ---- | ------- |

| `position` | `[PanelPosition](/api-reference/types/panel-position)` Position of minimap on pane. | `[PanelPosition](/api-reference/types/panel-position).BottomRight` |
| `onClick` | `(event: [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)<Element, [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)>, position: [XYPosition](/api-reference/types/xy-position)) => void` Callback called when minimap is clicked. | |
| `nodeColor` | `string \| GetMiniMapNodeAttribute<[Node](/api-reference/types/node)>` Color of nodes on minimap. | `"#e2e2e2"` |
| `nodeStrokeColor` | `string \| GetMiniMapNodeAttribute<[Node](/api-reference/types/node)>` Stroke color of nodes on minimap. | `"transparent"` |
| `nodeClassName` | `string \| GetMiniMapNodeAttribute<[Node](/api-reference/types/node)>` Class name applied to nodes on minimap. | `""` |
| `nodeBorderRadius` | `number` Border radius of nodes on minimap. | `5` |
| `nodeStrokeWidth` | `number` Stroke width of nodes on minimap. | `2` |
| `nodeComponent` | `[ComponentType](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L75)<[MiniMapNodeProps](/api-reference/types/mini-map-node-props)>` A custom component to render the nodes in the minimap. This component must render an SVG element! | |
| `bgColor` | `string` Background color of minimap. | |
| `maskColor` | `string` The color of the mask that covers the portion of the minimap not currently visible in the viewport. | `"rgba(240, 240, 240, 0.6)"` |
| `maskStrokeColor` | `string` Stroke color of mask representing viewport. | `transparent` |
| `maskStrokeWidth` | `number` Stroke width of mask representing viewport. | `1` |
| `onNodeClick` | `(event: [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)<Element, [MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6)>, node: [Node](/api-reference/types/node)) => void` Callback called when node on minimap is clicked. | |
| `pannable` | `boolean` Determines whether you can pan the viewport by dragging inside the minimap. | `false` |
| `zoomable` | `boolean` Determines whether you can zoom the viewport by scrolling inside the minimap. | `false` |
| `ariaLabel` | `string \| null` There is no text inside the minimap for a screen reader to use as an accessible name, so it’s important we provide one to make the minimap accessible. The default is sufficient, but you may want to replace it with something more relevant to your app or product. | `"Mini Map"` |
| `inversePan` | `boolean` Invert direction when panning the minimap viewport. | |
| `zoomStep` | `number` Step size for zooming in/out on minimap. | `10` |
| `offsetScale` | `number` Offset the viewport on the minimap, acts like a padding. | `5` |
| `...props` | `Omit<HTMLAttributes<SVGSVGElement>, "onClick">` | |

## Examples

### Making the mini map interactive

By default, the mini map is non-interactive. To allow users to interact with the viewport by panning or zooming the minimap, you can set either of the `zoomable` or `pannable` (or both!) props to `true`.

```tsx
import { ReactFlow, MiniMap } from '@xyflow/react';

export default function Flow() {
  return (
    <ReactFlow nodes={[...]]} edges={[...]]}>
      <MiniMap pannable zoomable />
    </ReactFlow>
  );
}
```

### Implement a custom mini map node

It is possible to pass a custom component to the `nodeComponent` prop to change how nodes are rendered in the mini map. If you do this you **must** use only SVG elements in your component if you want it to work correctly.

```tsx
import { ReactFlow, MiniMap } from '@xyflow/react';

export default function Flow() {
  return (
    <ReactFlow nodes={[...]]} edges={[...]]}>
      <MiniMap nodeComponent={MiniMapNode} />
    </ReactFlow>
  );
}

function MiniMapNode({ x, y }) {
  return <circle cx={x} cy={y} r="50" />;
}
```

Check out the documentation for [`MiniMapNodeProps`](/api-reference/types/mini-map-node-props) to see what props are passed to your custom component.

### Customising mini map node color

The `nodeColor`, `nodeStrokeColor`, and `nodeClassName` props can be a function that takes a [`Node`](/api-reference/types/node) and computes a value for the prop. This can be used to customize the appearance of each mini map node.

This example shows how to color each mini map node based on the node’s type:

```tsx
import { ReactFlow, MiniMap } from '@xyflow/react';

export default function Flow() {
  return (
    <ReactFlow nodes={[...]]} edges={[...]]}>
      <MiniMap nodeColor={nodeColor} />
    </ReactFlow>
  );
}

function nodeColor(node) {
  switch (node.type) {
    case 'input':
      return '#6ede87';
    case 'output':
      return '#6865A5';
    default:
      return '#ff0072';
  }
}
```

## TypeScript

This component accepts a generic type argument of custom node types. See this [section in our Typescript guide](/learn/advanced-use/typescript#nodetype-edgetype-unions) for more information.

```tsx
<MiniMap<CustomNodeType> nodeColor={nodeColor} />
```

Last updated on August 24, 2026

[

<Handle />

](/api-reference/components/handle)[

<NodeResizeControl />

](/api-reference/components/node-resize-control)
