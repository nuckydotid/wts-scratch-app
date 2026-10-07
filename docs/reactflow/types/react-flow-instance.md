---
title: "ReactFlowInstance"
description: "The ReactFlowInstance provides a collection of methods to query and manipulate the internal state of your flow. You can get an instance by using the useReactFlow hook or attaching a listener to the onInit event."
source: "https://reactflow.dev/api-reference/types/react-flow-instance"
---

# ReactFlowInstance

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/instance.ts/#L178-L179) 

The `ReactFlowInstance` provides a collection of methods to query and manipulate the internal state of your flow. You can get an instance by using the [`useReactFlow`](/api-reference/hooks/use-react-flow) hook or attaching a listener to the [`onInit`](/api-reference/react-flow#event-oninit) event.

## Fields

### Nodes and edges

| Name | Type | Default |
| ---- | ---- | ------- |

| `getNodes` | `() => [Node](/api-reference/types/node)[]` Returns nodes. | |
| `setNodes` | `(payload: [Node](/api-reference/types/node)[] \| ((nodes: [Node](/api-reference/types/node)[]) => [Node](/api-reference/types/node)[])) => void` Set your nodes array to something else by either overwriting it with a new array or by passing in a function to update the existing array. If using a function, it is important to make sure a new array is returned instead of mutating the existing array. Calling this function will trigger the `onNodesChange` handler in a controlled flow. | |
| `addNodes` | `(payload: [Node](/api-reference/types/node) \| [Node](/api-reference/types/node)[]) => void` Add one or many nodes to your existing nodes array. Calling this function will trigger the `onNodesChange` handler in a controlled flow. | |
| `getNode` | `(id: string) => [Node](/api-reference/types/node) \| undefined` Returns a node by id. | |
| `getInternalNode` | `(id: string) => [InternalNode](/api-reference/types/internal-node)<[Node](/api-reference/types/node)> \| undefined` Returns an internal node by id. | |
| `getEdges` | `() => [Edge](/api-reference/types/edge)[]` Returns edges. | |
| `setEdges` | `(payload: [Edge](/api-reference/types/edge)[] \| ((edges: [Edge](/api-reference/types/edge)[]) => [Edge](/api-reference/types/edge)[])) => void` Set your edges array to something else by either overwriting it with a new array or by passing in a function to update the existing array. If using a function, it is important to make sure a new array is returned instead of mutating the existing array. Calling this function will trigger the `onEdgesChange` handler in a controlled flow. | |
| `addEdges` | `(payload: [Edge](/api-reference/types/edge) \| [Edge](/api-reference/types/edge)[]) => void` Add one or many edges to your existing edges array. Calling this function will trigger the `onEdgesChange` handler in a controlled flow. | |
| `getEdge` | `(id: string) => [Edge](/api-reference/types/edge) \| undefined` Returns an edge by id. | |
| `toObject` | `() => [ReactFlowJsonObject](/api-reference/types/react-flow-json-object)<[Node](/api-reference/types/node), [Edge](/api-reference/types/edge)>` Returns the nodes, edges and the viewport as a JSON object. | |
| `deleteElements` | `(params: DeleteElementsOptions) => Promise<{ deletedNodes: [Node](/api-reference/types/node)[]; deletedEdges: [Edge](/api-reference/types/edge)[]; }>` Deletes nodes and edges. | |
| `updateNode` | `(id: string, nodeUpdate: [Partial](https://typescriptlang.org/docs/handbook/utility-types.html#partialtype)<[Node](/api-reference/types/node)> \| ((node: [Node](/api-reference/types/node)) => [Partial](https://typescriptlang.org/docs/handbook/utility-types.html#partialtype)<[Node](/api-reference/types/node)>), options?: { replace: boolean; } \| undefined) => void` Updates a node. | |
| `updateNodeData` | `(id: string, dataUpdate: [Partial](https://typescriptlang.org/docs/handbook/utility-types.html#partialtype)<[Record](https://typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)<string, unknown>> \| ((node: [Node](/api-reference/types/node)) => [Partial](https://typescriptlang.org/docs/handbook/utility-types.html#partialtype)<[Record](https://typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)<string, unknown>>), options?: { replace: boolean; } \| undefined) => void` Updates the data attribute of a node. | |
| `updateEdge` | `(id: string, edgeUpdate: [Partial](https://typescriptlang.org/docs/handbook/utility-types.html#partialtype)<[Edge](/api-reference/types/edge)> \| ((edge: [Edge](/api-reference/types/edge)) => [Partial](https://typescriptlang.org/docs/handbook/utility-types.html#partialtype)<[Edge](/api-reference/types/edge)>), options?: { replace: boolean; } \| undefined) => void` Updates an edge. | |
| `updateEdgeData` | `(id: string, dataUpdate: [Partial](https://typescriptlang.org/docs/handbook/utility-types.html#partialtype)<[Record](https://typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)<string, unknown> \| undefined> \| ((edge: [Edge](/api-reference/types/edge)) => [Partial](https://typescriptlang.org/docs/handbook/utility-types.html#partialtype)<[Record](https://typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)<string, unknown> \| undefined>), options?: { ...; } \| undefined) => void` Updates the data attribute of a edge. | |
| `getNodesBounds` | `(nodes: (string \| [Node](/api-reference/types/node) \| [InternalNode](/api-reference/types/internal-node))[]) => [Rect](/api-reference/types/rect)` Returns the bounds of the given nodes or node ids. | |
| `getHandleConnections` | `({ type, id, nodeId, }: { type: HandleType; nodeId: string; id?: string \| null; }) => [HandleConnection](/api-reference/types/handle-connection)[]` Get all the connections of a handle belonging to a specific node. The type parameter be either `'source'` or `'target'`. | |
| `getNodeConnections` | `({ type, handleId, nodeId, }: { type?: HandleType; nodeId: string; handleId?: string \| null; }) => [NodeConnection](/api-reference/types/node-connection)[]` Gets all connections to a node. Can be filtered by handle type and id. | |

### Intersections

| Name | Type | Default |
| ---- | ---- | ------- |

| `getIntersectingNodes` | `(node: [Node](/api-reference/types/node) \| [Rect](/api-reference/types/rect) \| { id: string; }, partially?: boolean \| undefined, nodes?: [Node](/api-reference/types/node)[] \| undefined) => [Node](/api-reference/types/node)[]` Find all the nodes currently intersecting with a given node or rectangle. The `partially` parameter can be set to `true` to include nodes that are only partially intersecting. | |
| `isNodeIntersecting` | `(node: [Node](/api-reference/types/node) \| [Rect](/api-reference/types/rect) \| { id: string; }, area: [Rect](/api-reference/types/rect), partially?: boolean \| undefined) => boolean` Determine if a given node or rectangle is intersecting with another rectangle. The `partially` parameter can be set to true return `true` even if the node is only partially intersecting. | |

### Viewport

| Name | Type | Default |
| ---- | ---- | ------- |

| `zoomIn` | `(options?: { duration?: number; ease?: (t: number) => number; interpolate?: "smooth" \| "linear"; }) => Promise<boolean>` Zooms viewport in by 1.2. | |
| `zoomOut` | `(options?: { duration?: number; ease?: (t: number) => number; interpolate?: "smooth" \| "linear"; }) => Promise<boolean>` Zooms viewport out by 1 / 1.2. | |
| `zoomTo` | `(zoomLevel: number, options?: { duration?: number; ease?: (t: number) => number; interpolate?: "smooth" \| "linear"; }) => Promise<boolean>` Zoom the viewport to a given zoom level. Passing in a `duration` will animate the viewport to the new zoom level. | |
| `getZoom` | `() => number` Get the current zoom level of the viewport. | |
| `setViewport` | `(viewport: [Viewport](/api-reference/types/viewport), options?: { duration?: number; ease?: (t: number) => number; interpolate?: "smooth" \| "linear"; }) => Promise<boolean>` Sets the current viewport. | |
| `getViewport` | `() => [Viewport](/api-reference/types/viewport)` Returns the current viewport. | |
| `setCenter` | `(x: number, y: number, options?: ViewportHelperFunctionOptions & { zoom?: number; }) => Promise<boolean>` Center the viewport on a given position. Passing in a `duration` will animate the viewport to the new position. | |
| `fitBounds` | `(bounds: [Rect](/api-reference/types/rect), options?: ViewportHelperFunctionOptions & { padding?: number; }) => Promise<boolean>` A low-level utility function to fit the viewport to a given rectangle. By passing in a `duration`, the viewport will animate from its current position to the new position. The `padding` option can be used to add space around the bounds. | |
| `screenToFlowPosition` | `(clientPosition: [XYPosition](/api-reference/types/xy-position), options?: { snapToGrid?: boolean; snapGrid?: [SnapGrid](/api-reference/types/snap-grid); } \| undefined) => [XYPosition](/api-reference/types/xy-position)` With this function you can translate a screen pixel position to a flow position. It is useful for implementing drag and drop from a sidebar for example. | |
| `flowToScreenPosition` | `(flowPosition: [XYPosition](/api-reference/types/xy-position)) => [XYPosition](/api-reference/types/xy-position)` Translate a position inside the flow’s canvas to a screen pixel position. | |
| `viewportInitialized` | `boolean` React Flow needs to mount the viewport to the DOM and initialize its zoom and pan behavior. This property tells you when viewport is initialized. | |
| `fitView` | `(fitViewOptions?: { padding?: Padding; includeHiddenNodes?: boolean; minZoom?: number; maxZoom?: number; duration?: number; ease?: (t: number) => number; interpolate?: "smooth" \| "linear"; nodes?: ([NodeType](/api-reference/types/node) \| { id: string; })[]; }) => Promise<boolean>` Fits the view based on the passed params. By default it fits the view to all nodes. | |

Last updated on August 24, 2026

[

ProOptions

](/api-reference/types/pro-options)[

ReactFlowJsonObject

](/api-reference/types/react-flow-json-object)
