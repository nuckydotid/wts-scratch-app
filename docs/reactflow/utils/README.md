---
title: "Utils"
description: "React Flow - Customizable library for rendering workflows, diagrams and node-based UIs."
source: "https://reactflow.dev/api-reference/utils"
---

# Utils

## [addEdge()](./add-edge.md)

This util is a convenience function to add a new Edge to an array of edges. It also performs some validation to make sure you don't add an invalid edge or duplicate an existing one.

[Read more](./add-edge.md)

## [applyEdgeChanges()](./apply-edge-changes.md)

Various events on the ReactFlow component can produce an EdgeChange that describes how to update the edges of your flow in some way. If you don't need any custom behavior, this util can be used to take an array of these changes and apply them to your edges.

[Read more](./apply-edge-changes.md)

## [applyNodeChanges()](./apply-node-changes.md)

Various events on the ReactFlow component can produce a NodeChange that describes how to update the nodes of your flow in some way. If you don't need any custom behavior, this util can be used to take an array of these changes and apply them to your nodes.

[Read more](./apply-node-changes.md)

## [getBezierPath()](./get-bezier-path.md)

The getBezierPath util returns everything you need to render a bezier edge between two nodes.

[Read more](./get-bezier-path.md)

## [getConnectedEdges()](./get-connected-edges.md)

Given an array of nodes that may be connected to one another and an array of all your edges, this util gives you an array of edges that connect any of the given nodes together.

[Read more](./get-connected-edges.md)

## [getIncomers()](./get-incomers.md)

This util is used to tell you what nodes, if any, are connected to the given node as the source of an edge.

[Read more](./get-incomers.md)

## [getNodesBounds()](./get-nodes-bounds.md)

Returns the bounding box that contains all the given nodes in an array. This can be useful when combined with \`getViewportForBounds\` to calculate the correct transform to fit the given nodes in a viewport.

[Read more](./get-nodes-bounds.md)

## [getOutgoers()](./get-outgoers.md)

This util is used to tell you what nodes, if any, are connected to the given node as the target of an edge.

[Read more](./get-outgoers.md)

## [getSimpleBezierPath()](./get-simple-bezier-path.md)

The getSimpleBezierPath util returns everything you need to render a simple bezier edge between two nodes.

[Read more](./get-simple-bezier-path.md)

## [getSmoothStepPath()](./get-smooth-step-path.md)

The getSmoothStepPath util returns everything you need to render a stepped path between two nodes. The borderRadius property can be used to choose how rounded the corners of those steps are.

[Read more](./get-smooth-step-path.md)

## [getStraightPath()](./get-straight-path.md)

Calculates the straight line path between two points.

[Read more](./get-straight-path.md)

## [getViewportForBounds()](./get-viewport-for-bounds.md)

This util returns the viewport for the given bounds. You might use this to pre-calculate the viewport for a given set of nodes on the server or calculate the viewport for the given bounds \_without\_ changing the viewport directly.

[Read more](./get-viewport-for-bounds.md)

## [isEdge()](./is-edge.md)

Test whether an object is usable as an Edge. In TypeScript this is a type guard that will narrow the type of whatever you pass in to Edge if it returns true.

[Read more](./is-edge.md)

## [isNode()](./is-node.md)

Test whether an object is usable as a Node. In TypeScript this is a type guard that will narrow the type of whatever you pass in to Node if it returns true.

[Read more](./is-node.md)

## [reconnectEdge()](./reconnect-edge.md)

A handy utility to reconnect an existing Edge with new properties. This searches your edge array for an edge with a matching id and updates its properties with the connection you provide.

[Read more](./reconnect-edge.md)

Last updated on August 24, 2026

[

ZIndexMode

](/types/z-index-mode.md)[

addEdge()

](./add-edge.md)
