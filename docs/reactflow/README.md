# React Flow API Reference & Guide

Welcome to the **React Flow (`@xyflow/react`)** API reference documentation for the Worktrees Studio Monorepo. React Flow is a highly customizable React library for building interactive node-based UIs, workflow builders, flowchart editors, visual programming tools, and data pipelines.

---

## 📦 Installation & Setup

```bash
bun add @xyflow/react
```

### Essential Styles

React Flow requires its base CSS styles to render node positions, handles, edges, and overlays correctly:

```tsx
import "@xyflow/react/dist/style.css";
```

---

## 🚀 Core Quick Start

```tsx
import React, { useCallback } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type OnConnect,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const initialNodes: Node[] = [
  { id: "1", position: { x: 0, y: 0 }, data: { label: "Start Node" } },
  { id: "2", position: { x: 0, y: 100 }, data: { label: "Target Node" } },
];

const initialEdges: Edge[] = [{ id: "e1-2", source: "1", target: "2" }];

export function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  return (
    <div style={{ width: "100%", height: "500px" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
```

---

## 🗺️ Documentation Directory

### 1. Core Containers & Providers

| Component / Provider    | Purpose                                                                        | Documentation                                          |
| :---------------------- | :----------------------------------------------------------------------------- | :----------------------------------------------------- |
| `<ReactFlow />`         | Master canvas component managing nodes, edges, interactions, and viewports     | [react-flow.md](react-flow.md)                         |
| `<ReactFlowProvider />` | Context wrapper providing access to the React Flow store outside `<ReactFlow>` | [react-flow-provider.md](react-flow-provider.md)       |
| `API Overview`          | Summary of API reference architecture                                          | [api-reference-overview.md](api-reference-overview.md) |

---

### 2. Built-in Components (`docs/reactflow/components/`)

| Component               | Description                                                 | Reference                                                              |
| :---------------------- | :---------------------------------------------------------- | :--------------------------------------------------------------------- |
| `<Background />`        | Canvas background grid (lines, dots, cross patterns)        | [components/background.md](components/background.md)                   |
| `<BaseEdge />`          | Low-level SVG path renderer for custom edges                | [components/base-edge.md](components/base-edge.md)                     |
| `<ControlButton />`     | Custom action button within `<Controls>`                    | [components/control-button.md](components/control-button.md)           |
| `<Controls />`          | Viewport controls toolbar (zoom, fit view, lock/unlock)     | [components/controls.md](components/controls.md)                       |
| `<EdgeLabelRenderer />` | HTML portal for edge labels outside the SVG container       | [components/edge-label-renderer.md](components/edge-label-renderer.md) |
| `<EdgeText />`          | SVG text helper for edge labels                             | [components/edge-text.md](components/edge-text.md)                     |
| `<EdgeToolbar />`       | Interactive toolbar pinned to selected edges                | [components/edge-toolbar.md](components/edge-toolbar.md)               |
| `<Handle />`            | Connection anchor points on custom nodes (source / target)  | [components/handle.md](components/handle.md)                           |
| `<MiniMap />`           | Canvas minimap overview and navigation thumbnail            | [components/minimap.md](components/minimap.md)                         |
| `<NodeResizeControl />` | Custom single-handle resizer for nodes                      | [components/node-resize-control.md](components/node-resize-control.md) |
| `<NodeResizer />`       | Multi-handle bounding box resizer for nodes                 | [components/node-resizer.md](components/node-resizer.md)               |
| `<NodeToolbar />`       | Contextual action toolbar attached to custom nodes          | [components/node-toolbar.md](components/node-toolbar.md)               |
| `<Panel />`             | Fixed overlay container (top-left, top-right, bottom, etc.) | [components/panel.md](components/panel.md)                             |
| `<ViewportPortal />`    | Render elements that transform with the viewport            | [components/viewport-portal.md](components/viewport-portal.md)         |

---

### 3. Hooks Reference (`docs/reactflow/hooks/`)

| Hook                       | Purpose                                                                                  | Reference                                                                |
| :------------------------- | :--------------------------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| `useReactFlow()`           | Imperative graph manipulations (`zoomIn`, `fitView`, `setNodes`, `screenToFlowPosition`) | [hooks/use-react-flow.md](hooks/use-react-flow.md)                       |
| `useNodesState()`          | Helper hook for managing controlled nodes and standard change events                     | [hooks/use-nodes-state.md](hooks/use-nodes-state.md)                     |
| `useEdgesState()`          | Helper hook for managing controlled edges and standard change events                     | [hooks/use-edges-state.md](hooks/use-edges-state.md)                     |
| `useNodes()`               | Returns the current array of nodes                                                       | [hooks/use-nodes.md](hooks/use-nodes.md)                                 |
| `useEdges()`               | Returns the current array of edges                                                       | [hooks/use-edges.md](hooks/use-edges.md)                                 |
| `useNodesData()`           | Reactive node data selector subscribed to specific node IDs                              | [hooks/use-nodes-data.md](hooks/use-nodes-data.md)                       |
| `useInternalNode()`        | Get internal node data including dimensions and handle bounds                            | [hooks/use-internal-node.md](hooks/use-internal-node.md)                 |
| `useNodeId()`              | Get the ID of the current node inside a custom node component                            | [hooks/use-node-id.md](hooks/use-node-id.md)                             |
| `useConnection()`          | Access current in-progress edge connection state                                         | [hooks/use-connection.md](hooks/use-connection.md)                       |
| `useHandleConnections()`   | Subscribe to incoming or outgoing connections on a specific handle                       | [hooks/use-handle-connections.md](hooks/use-handle-connections.md)       |
| `useNodeConnections()`     | Subscribe to all connections for a node                                                  | [hooks/use-node-connections.md](hooks/use-node-connections.md)           |
| `useNodesInitialized()`    | Check if all initial nodes have measured their DOM bounding boxes                        | [hooks/use-nodes-initialized.md](hooks/use-nodes-initialized.md)         |
| `useKeyPress()`            | Listen to keyboard shortcuts (e.g., Space, Backspace, Meta)                              | [hooks/use-key-press.md](hooks/use-key-press.md)                         |
| `useOnSelectionChange()`   | Register listeners for node and edge selection events                                    | [hooks/use-on-selection-change.md](hooks/use-on-selection-change.md)     |
| `useOnViewportChange()`    | Register listeners for viewport pan and zoom transitions                                 | [hooks/use-on-viewport-change.md](hooks/use-on-viewport-change.md)       |
| `useViewport()`            | Reactive hook providing `{ x, y, zoom }` coordinates                                     | [hooks/use-viewport.md](hooks/use-viewport.md)                           |
| `useUpdateNodeInternals()` | Force re-calculation of node handles when dynamic handles change                         | [hooks/use-update-node-internals.md](hooks/use-update-node-internals.md) |
| `useStore()`               | Direct Zustand slice selector on the internal React Flow store                           | [hooks/use-store.md](hooks/use-store.md)                                 |
| `useStoreApi()`            | Direct reference to the Zustand store API                                                | [hooks/use-store-api.md](hooks/use-store-api.md)                         |

---

### 4. Utility Functions (`docs/reactflow/utils/`)

| Utility Function         | Purpose                                                                | Reference                                                            |
| :----------------------- | :--------------------------------------------------------------------- | :------------------------------------------------------------------- |
| `addEdge()`              | Safely append an edge or update existing target handles                | [utils/add-edge.md](utils/add-edge.md)                               |
| `applyNodeChanges()`     | Apply position, selection, dimensions, or removal diffs to node arrays | [utils/apply-node-changes.md](utils/apply-node-changes.md)           |
| `applyEdgeChanges()`     | Apply selection or removal diffs to edge arrays                        | [utils/apply-edge-changes.md](utils/apply-edge-changes.md)           |
| `getBezierPath()`        | Calculate cubic Bézier SVG path and label center coordinates           | [utils/get-bezier-path.md](utils/get-bezier-path.md)                 |
| `getSmoothStepPath()`    | Calculate rounded orthogonal step SVG path                             | [utils/get-smooth-step-path.md](utils/get-smooth-step-path.md)       |
| `getStraightPath()`      | Calculate straight line SVG path                                       | [utils/get-straight-path.md](utils/get-straight-path.md)             |
| `getSimpleBezierPath()`  | Calculate simple 2D Bézier curve path                                  | [utils/get-simple-bezier-path.md](utils/get-simple-bezier-path.md)   |
| `getConnectedEdges()`    | Find all edges attached to a given list of nodes                       | [utils/get-connected-edges.md](utils/get-connected-edges.md)         |
| `getIncomers()`          | Find all upstream predecessor nodes connected to a node                | [utils/get-incomers.md](utils/get-incomers.md)                       |
| `getOutgoers()`          | Find all downstream successor nodes connected from a node              | [utils/get-outgoers.md](utils/get-outgoers.md)                       |
| `getNodesBounds()`       | Calculate bounding box rectangle for a collection of nodes             | [utils/get-nodes-bounds.md](utils/get-nodes-bounds.md)               |
| `getViewportForBounds()` | Calculate optimal `{ x, y, zoom }` for a target bounding box           | [utils/get-viewport-for-bounds.md](utils/get-viewport-for-bounds.md) |
| `isNode()`               | Type predicate verifying if an object is a valid `Node`                | [utils/is-node.md](utils/is-node.md)                                 |
| `isEdge()`               | Type predicate verifying if an object is a valid `Edge`                | [utils/is-edge.md](utils/is-edge.md)                                 |
| `reconnectEdge()`        | Update existing edge when its handle endpoint is dragged to a new node | [utils/reconnect-edge.md](utils/reconnect-edge.md)                   |

---

### 5. TypeScript Types & Interfaces (`docs/reactflow/types/`)

Key types documented in `types/`:

- [Node](types/node.md) & [NodeProps](types/node-props.md) & [NodeTypes](types/node-types.md)
- [Edge](types/edge.md) & [EdgeProps](types/edge-props.md) & [EdgeTypes](types/edge-types.md)
- [Connection](types/connection.md) & [ConnectionMode](types/connection-mode.md) & [ConnectionState](types/connection-state.md)
- [ReactFlowInstance](types/react-flow-instance.md) & [ReactFlowJsonObject](types/react-flow-json-object.md)
- [FitViewOptions](types/fit-view-options.md) & [Viewport](types/viewport.md) & [XYPosition](types/xy-position.md)
- [NodeChange](types/node-change.md) & [EdgeChange](types/edge-change.md)
- [Handle](types/handle.md) & [HandleConnection](types/handle-connection.md) & [NodeHandle](types/node-handle.md)
- [Position](types/position.md) & [Align](types/align.md) & [MarkerType](types/marker-type.md)
- [MiniMapNodeProps](types/mini-map-node-props.md) & [PanelPosition](types/panel-position.md)
- [All 69 Types](types/README.md)

---

## 💡 Best Practices & Architectural Guidelines

1. **Memoize `nodeTypes` and `edgeTypes`**: Never define `nodeTypes = { custom: CustomNode }` inside the component render body. Define it outside the component or wrap with `useMemo()`. Otherwise, all nodes will unmount and remount on every re-render.
2. **Container Dimensions**: `<ReactFlow />` inherits dimensions from its parent container. The parent container **must** have an explicit non-zero width and height (`width: '100%', height: '100%'` or fixed `height: 600px`).
3. **Custom Node Handles**: Every custom node must specify `<Handle type="target" position={Position.Top} />` and/or `<Handle type="source" position={Position.Bottom} />`. If adding or removing handles dynamically at runtime, call `useUpdateNodeInternals(id)`.
4. **Coordinate Transformation**: Use `screenToFlowPosition({ x: clientX, y: clientY })` from `useReactFlow()` when dropping elements onto the canvas from external drag-and-drop sidebars.
5. **DOM Components in Expo/React Native**: To render React Flow in Expo applications, use Expo DOM Components (`'use dom';`) to embed the React Flow canvas cleanly without native C++ crashes.
