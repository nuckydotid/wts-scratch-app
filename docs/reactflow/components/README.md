---
title: "Components"
description: "React Flow - Customizable library for rendering workflows, diagrams and node-based UIs."
source: "https://reactflow.dev/api-reference/components"
---

# Components

## [<Background />](./background.md)

The Background component makes it convenient to render different types of backgrounds common in node-based UIs. It comes with three variants: lines, dots and cross.

[Read more](./background.md)

## [<BaseEdge />](./base-edge.md)

The BaseEdge component gets used internally for all the edges. It can be used inside a custom edge and handles the invisible helper edge and the edge label for you.

[Read more](./base-edge.md)

## [<ControlButton />](./control-button.md)

You can add buttons to the control panel by using the ControlButton component and pass it as a child to the Controls component.

[Read more](./control-button.md)

## [<Controls />](./controls.md)

The Controls component renders a small panel that contains convenient buttons to zoom in, zoom out, fit the view, and lock the viewport.

[Read more](./controls.md)

## [<EdgeLabelRenderer />](./edge-label-renderer.md)

Edges are SVG-based. If you want to render more complex labels you can use the EdgeLabelRenderer component to access a div based renderer. This component is a portal that renders the label in a div that is positioned on top of the edges. You can see an example usage of the component in the edge label renderer example.

[Read more](./edge-label-renderer.md)

## [<EdgeText />](./edge-text.md)

You can use the EdgeText component as a helper component to display text within your custom edges.

[Read more](./edge-text.md)

## [<EdgeToolbar />](./edge-toolbar.md)

The EdgeToolbar component can render a toolbar or tooltip to one side of a custom edge. This toolbar doesn't scale with the viewport so that the content doesn't get too small when zooming out.

[Read more](./edge-toolbar.md)

## [<Handle />](./handle.md)

The Handle component is used in your custom nodes to define connection points.

[Read more](./handle.md)

## [<MiniMap />](./minimap.md)

The MiniMap component can be used to render an overview of your flow. It renders each node as an SVG element and visualizes where the current viewport is in relation to the rest of the flow.

[Read more](./minimap.md)

## [<NodeResizeControl />](./node-resize-control.md)

To create your own resizing UI, you can use the NodeResizeControl component where you can pass children (such as icons).

[Read more](./node-resize-control.md)

## [<NodeResizer />](./node-resizer.md)

The NodeResizer component can be used to add a resize functionality to your nodes. It renders draggable controls around the node to resize in all directions.

[Read more](./node-resizer.md)

## [<NodeToolbar />](./node-toolbar.md)

The NodeToolbar component can render a toolbar or tooltip to one side of a custom node. This toolbar doesn't scale with the viewport so that the content is always visible.

[Read more](./node-toolbar.md)

## [<Panel />](./panel.md)

The Panel component helps you position content above the viewport. It is used internally by the MiniMap and Controls components.

[Read more](./panel.md)

## [<ViewportPortal />](./viewport-portal.md)

The ViewportPortal component can be used to add components to the same viewport of the flow where nodes and edges are rendered. This is useful when you want to render your own components that are adhere to the same coordinate system as the nodes & edges and are also affected by zooming and panning

[Read more](./viewport-portal.md)

Last updated on August 24, 2026

[<ReactFlowProvider />](../react-flow-provider.md "[ReactFlowProvider />]")[

<Background />

](./background.md)
