# React Flow Architecture & Standards Rules

Rules and patterns for building diagramming, flowchart, and node-based visual workflows with `@xyflow/react`.

## 📦 Core Rules & Anti-Patterns

1. **Memoize Types:** Always define `nodeTypes` and `edgeTypes` outside the component scope or wrap with `useMemo()`. Never pass an inline object literal to `nodeTypes` or `edgeTypes`, as it forces all canvas nodes to unmount and remount on every frame.
2. **Container Dimensions:** The parent DOM element wrapping `<ReactFlow />` must have explicit CSS dimensions (e.g. `width: 100%`, `height: 600px` or `height: 100vh`). Without explicit dimensions, the canvas will collapse to 0x0.
3. **Base Stylesheet:** Always import `@xyflow/react/dist/style.css` at the component or app root.
4. **Handles on Custom Nodes:** Every custom node must render at least one `<Handle type="target" ... />` or `<Handle type="source" ... />` with a defined `Position`. If adding or removing handles conditionally, trigger `useUpdateNodeInternals(id)` to recalculate handle bounds.
5. **Interactive Edge Labels:** When placing buttons or inputs inside `<EdgeLabelRenderer />`, always attach the CSS classes `nodrag nopan` and set `pointerEvents: 'all'` to prevent canvas pan gestures from capturing clicks.
6. **Mobile Integration:** For React Native / Expo apps, isolate React Flow inside an Expo DOM Component (`'use dom';`) to avoid native thread blocking and ensure seamless cross-platform rendering.
