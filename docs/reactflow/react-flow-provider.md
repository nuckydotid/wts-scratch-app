---
title: "<ReactFlowProvider />"
description: "React Flow - Customizable library for rendering workflows, diagrams and node-based UIs."
source: "https://reactflow.dev/api-reference/react-flow-provider"
---

# <ReactFlowProvider />

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/components/ReactFlowProvider/index.tsx/#L9) 

The `<ReactFlowProvider />` component is a [context provider](https://react.dev/learn/passing-data-deeply-with-context#)  that makes it possible to access a flow’s internal state outside of the [`<ReactFlow />`](/api-reference/react-flow) component. Many of the hooks we provide rely on this component to work.

```tsx
import { ReactFlow, ReactFlowProvider, useNodes } from '@xyflow/react'

export default function Flow() {
  return (
    <ReactFlowProvider>
      <ReactFlow nodes={...} edges={...} />
      <Sidebar />
    </ReactFlowProvider>
  )
}

function Sidebar() {
  // This hook will only work if the component it's used in is a child of a
  // <ReactFlowProvider />.
  const nodes = useNodes()

  return (
    <aside>
      {nodes.map((node) => (
        <div key={node.id}>
          Node {node.id} -
            x: {node.position.x.toFixed(2)},
            y: {node.position.y.toFixed(2)}
        </div>
      ))}
    </aside>
  )
}
```

## Props

| Name | Type | Default |
| ---- | ---- | ------- |

| `initialNodes` | `[Node](/api-reference/types/node)[]` These nodes are used to initialize the flow. They are not dynamic. | |
| `initialEdges` | `[Edge](/api-reference/types/edge)[]` These edges are used to initialize the flow. They are not dynamic. | |
| `defaultNodes` | `[Node](/api-reference/types/node)[]` These nodes are used to initialize the flow. They are not dynamic. | |
| `defaultEdges` | `[Edge](/api-reference/types/edge)[]` These edges are used to initialize the flow. They are not dynamic. | |
| `initialWidth` | `number` The initial width is necessary to be able to use fitView on the server | |
| `initialHeight` | `number` The initial height is necessary to be able to use fitView on the server | |
| `fitView` | `boolean` When `true`, the flow will be zoomed and panned to fit all the nodes initially provided. | |
| `initialFitViewOptions` | `FitViewOptionsBase<[NodeType](/api-reference/types/node)>` You can provide an object of options to customize the initial fitView behavior. | |
| `initialMinZoom` | `number` Initial minimum zoom level | |
| `initialMaxZoom` | `number` Initial maximum zoom level | |
| `nodeOrigin` | `[NodeOrigin](/api-reference/types/node-origin)` The origin of the node to use when placing it in the flow or looking up its `x` and `y` position. An origin of `[0, 0]` means that a node’s top left corner will be placed at the `x` and `y` position. | `[0, 0]` |
| `nodeExtent` | `[CoordinateExtent](/api-reference/types/coordinate-extent)` By default, nodes can be placed on an infinite flow. You can use this prop to set a boundary. The first pair of coordinates is the top left boundary and the second pair is the bottom right. | |
| `children` | `[ReactNode](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/d7e13a7c7789d54cf8d601352517189e82baf502/types/react/index.d.ts#L264)` | |
| `zIndexMode` | `[ZIndexMode](/api-reference/types/z-index-mode)` | |

## Notes

- If you’re using a router and want your flow’s state to persist across routes, it’s vital that you place the `<ReactFlowProvider />` component _outside_ of your router.
- If you have multiple flows on the same page you will need to use a separate `<ReactFlowProvider />` for each flow.

Last updated on August 24, 2026

[<ReactFlow />](/api-reference/react-flow "<ReactFlow />")[Components](/api-reference/components "Components")
