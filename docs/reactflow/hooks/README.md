---
title: "Hooks"
description: "React Flow - Customizable library for rendering workflows, diagrams and node-based UIs."
source: "https://reactflow.dev/api-reference/hooks"
---

# Hooks

## [useConnection()](./use-connection.md)

The useConnection hook returns the current connection when there is an active connection interaction. If no connection interaction is active, it returns null for every property. A typical use case for this hook is to colorize handles based on a certain condition (e.g. if the connection is valid or not).

[Read more](./use-connection.md)

## [useEdges()](./use-edges.md)

This hook returns an array of the current edges. Components that use this hook will re-render whenever any edge changes.

[Read more](./use-edges.md)

## [useEdgesState()](./use-edges-state.md)

This hook makes it easy to prototype a controlled flow where you manage the state of nodes and edges outside the ReactFlowInstance. You can think of it like React's \`useState\` hook with an additional helper callback.

[Read more](./use-edges-state.md)

## [useHandleConnections()](./use-handle-connections.md)

This hook returns an array of the current edges. Components that use this hook will re-render whenever any edge changes.

[Read more](./use-handle-connections.md)

## [useInternalNode()](./use-internal-node.md)

This hook returns an InternalNode object for the given node ID.

[Read more](./use-internal-node.md)

## [useKeyPress()](./use-key-press.md)

This hook lets you listen for specific key codes and tells you whether they are currently pressed or not.

[Read more](./use-key-press.md)

## [useNodeConnections()](./use-node-connections.md)

This hook returns an array of connected edges. Components that use this hook will re-render whenever any edge changes.

[Read more](./use-node-connections.md)

## [useNodeId()](./use-node-id.md)

You can use this hook to get the id of the node it is used inside. It is useful if you need the node's id deeper in the render tree but don't want to manually drill down the id as a prop.

[Read more](./use-node-id.md)

## [useNodes()](./use-nodes.md)

This hook returns an array of the current nodes. Components that use this hook will re-render whenever any node changes, including when a node is selected or moved.

[Read more](./use-nodes.md)

## [useNodesData()](./use-nodes-data.md)

With this hook you can subscribe to changes of a node data of a specific node.

[Read more](./use-nodes-data.md)

## [useNodesInitialized()](./use-nodes-initialized.md)

This hook tells you whether all the nodes in a flow have been measured and given a width and height. When you add a node to the flow, this hook will return false and then true again once the node has been measured.

[Read more](./use-nodes-initialized.md)

## [useNodesState()](./use-nodes-state.md)

This hook makes it easy to prototype a controlled flow where you manage the state of nodes and edges outside the ReactFlowInstance. You can think of it like React's \`useState\` hook with an additional helper callback.

[Read more](./use-nodes-state.md)

## [useOnSelectionChange()](./use-on-selection-change.md)

This hook lets you listen for changes to both node and edge selection. As the name implies, the callback you provide will be called whenever the selection of either nodes or edges changes.

[Read more](./use-on-selection-change.md)

## [useOnViewportChange()](./use-on-viewport-change.md)

The useOnViewportChange hook lets you listen for changes to the viewport such as panning and zooming. You can provide a callback for each phase of a viewport change: onStart, onChange, and onEnd.

[Read more](./use-on-viewport-change.md)

## [useReactFlow()](./use-react-flow.md)

This hook returns a ReactFlowInstance that can be used to update nodes and edges, manipulate the viewport, or query the current state of the flow.

[Read more](./use-react-flow.md)

## [useStore()](./use-store.md)

This hook can be used to subscribe to internal state changes of the React Flow component. The useStore hook is re-exported from the Zustand state management library, so you should check out their docs for more details.

[Read more](./use-store.md)

## [useStoreApi()](./use-store-api.md)

In some cases, you might need to access the store directly. This hook returns the store object which can be used on demand to access the state or dispatch actions.

[Read more](./use-store-api.md)

## [useUpdateNodeInternals()](./use-update-node-internals.md)

When you programmatically add or remove handles to a node or update a node's handle position, you need to let React Flow know about it using this hook. This will update the internal dimensions of the node and properly reposition handles on the canvas if necessary.

[Read more](./use-update-node-internals.md)

## [useViewport()](./use-viewport.md)

The useViewport hook is a convenient way to read the current state of the Viewport in a component. Components that use this hook will re-render whenever the viewport changes.

[Read more](./use-viewport.md)

Last updated on August 24, 2026

[

<ViewportPortal />

](/components/viewport-portal.md)[

useConnection()

](./use-connection.md)
