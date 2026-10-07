---
title: "Types"
description: "React Flow - Customizable library for rendering workflows, diagrams and node-based UIs."
source: "https://reactflow.dev/api-reference/types"
---

# Types

## [Align](./align.md)

The Align type contains the values expected by the align prop of the NodeToolbar component

[Read more](./align.md)

## [AriaLabelConfig](./aria-label-config.md)

With the AriaLabelConfig you can customize the aria labels and descriptions used by React Flow.

[Read more](./aria-label-config.md)

## [BackgroundVariant](./background-variant.md)

The three variants are exported as an enum for convenience. You can either import the enum and use it like BackgroundVariant.Lines or you can use the raw string value directly.

[Read more](./background-variant.md)

## [ColorMode](./color-mode.md)

The ColorMode type defines the available color modes for the ReactFlow component.

[Read more](./color-mode.md)

## [Connection](./connection.md)

The Connection type is the basic minimal description of an Edge between two nodes. The addEdge util can be used to upgrade a Connection to an Edge.

[Read more](./connection.md)

## [ConnectionLineComponent](./connection-line-component.md)

Custom React component for rendering the connection line during edge creation.

[Read more](./connection-line-component.md)

## [ConnectionLineComponentProps](./connection-line-component-props.md)

If you want to render a custom component for connection lines, you can set the connectionLineComponent prop on the ReactFlow component. The ConnectionLineComponentProps are passed to your custom component.

[Read more](./connection-line-component-props.md)

## [ConnectionLineType](./connection-line-type.md)

If you set the connectionLineType prop on your ReactFlow component, it will dictate the style of connection line rendered when creating new edges.

[Read more](./connection-line-type.md)

## [ConnectionMode](./connection-mode.md)

Specifies the rules for how connections between nodes are established.

[Read more](./connection-mode.md)

## [ConnectionState](./connection-state.md)

Data about an ongoing connection.

[Read more](./connection-state.md)

## [CoordinateExtent](./coordinate-extent.md)

A coordinate extent represents two points in a coordinate system: one in the top left corner and one in the bottom right corner. It is used to represent the bounds of nodes in the flow or the bounds of the viewport.

[Read more](./coordinate-extent.md)

## [DefaultEdgeOptions](./default-edge-options.md)

Many properties on an Edge are optional. When a new edge is created, the properties that are not provided will be filled in with the default values passed to the defaultEdgeOptions prop of the ReactFlow component.

[Read more](./default-edge-options.md)

## [DeleteElements](./delete-elements.md)

DeleteElements deletes nodes and edges from the flow and return the deleted edges and nodes asynchronously.

[Read more](./delete-elements.md)

## [Edge](./edge.md)

Where a Connection is the minimal description of an edge between two nodes, an \`Edge\` is the complete description with everything React Flow needs to know in order to render it.

[Read more](./edge.md)

## [EdgeChange](./edge-change.md)

The onEdgesChange callback takes an array of EdgeChange objects that you should use to update your flow's state. The EdgeChange type is a union of four different object types that represent that various ways an edge can change in a flow.

[Read more](./edge-change.md)

## [EdgeMarker](./edge-marker.md)

Edges can optionally have markers at the start and end of an edge. The EdgeMarker type is used to configure those markers! Check the docs for MarkerType for details on what types of edge marker are available.

[Read more](./edge-marker.md)

## [EdgeMouseHandler](./edge-mouse-handler.md)

The EdgeMouseHandler type defines the callback function that is called when mouse events occur on an edge.

[Read more](./edge-mouse-handler.md)

## [EdgeProps](./edge-props.md)

When you implement a custom edge it is wrapped in a component that enables some basic functionality. Your custom edge component receives the following props:

[Read more](./edge-props.md)

## [EdgeTypes](./edge-types.md)

The EdgeTypes type is used to define custom edge types.

[Read more](./edge-types.md)

## [FitViewOptions](./fit-view-options.md)

When calling fitView these options can be used to customize the behavior. For example, the duration option can be used to transform the viewport smoothly over a given amount of time.

[Read more](./fit-view-options.md)

## [Handle](./handle.md)

Handle attributes like id, position, and type.

[Read more](./handle.md)

## [HandleConnection](./handle-connection.md)

The HandleConnection type is a Connection that includes the edgeId.

[Read more](./handle-connection.md)

## [InternalNode](./internal-node.md)

The InternalNode is an extension of the base Node type with additional properties React Flow uses internally for rendering.

[Read more](./internal-node.md)

## [IsValidConnection](./is-valid-connection.md)

Function type that determines whether a connection between nodes is valid.

[Read more](./is-valid-connection.md)

## [KeyCode](./key-code.md)

Represents keyboard key codes or combinations.

[Read more](./key-code.md)

## [MarkerType](./marker-type.md)

Edges may optionally have a marker on either end. The MarkerType type enumerates the options available to you when configuring a given marker.

[Read more](./marker-type.md)

## [MiniMapNodeProps](./mini-map-node-props.md)

The MiniMapNodeProps type defines the properties for nodes in a minimap component.

[Read more](./mini-map-node-props.md)

## [Node](./node.md)

The Node type represents everything React Flow needs to know about a given node. Many of these properties can be manipulated both by React Flow or by you, but some such as width and height should be considered read-only.

[Read more](./node.md)

## [NodeChange](./node-change.md)

The onNodesChange callback takes an array of NodeChange objects that you should use to update your flow's state. The NodeChange type is a union of six different object types that represent that various ways an node can change in a flow.

[Read more](./node-change.md)

## [NodeConnection](./node-connection.md)

The NodeConnection type is a Connection that includes the edgeId.

[Read more](./node-connection.md)

## [NodeHandle](./node-handle.md)

The NodeHandle type is used to define a handle for a node if server side rendering is used.

[Read more](./node-handle.md)

## [NodeMouseHandler](./node-mouse-handler.md)

The NodeMouseHandler type defines the callback function that is called when mouse events occur on a node.

[Read more](./node-mouse-handler.md)

## [NodeOrigin](./node-origin.md)

The origin of a Node determines how it is placed relative to its own coordinates.

[Read more](./node-origin.md)

## [NodeProps](./node-props.md)

When you implement a custom node it is wrapped in a component that enables basic functionality like selection and dragging. Your custom node receives the following props:

[Read more](./node-props.md)

## [NodeTypes](./node-types.md)

The NodeTypes type is used to define custom node types.

[Read more](./node-types.md)

## [OnBeforeDelete](./on-before-delete.md)

The OnBeforeDelete type defines the callback function that is called before nodes or edges are deleted.

[Read more](./on-before-delete.md)

## [OnConnect](./on-connect.md)

Callback function triggered when a new connection is created between nodes.

[Read more](./on-connect.md)

## [OnConnectEnd](./on-connect-end.md)

Callback function triggered when finishing or canceling a connection attempt between nodes.

[Read more](./on-connect-end.md)

## [OnConnectStart](./on-connect-start.md)

Callback function triggered when starting to create a connection between nodes.

[Read more](./on-connect-start.md)

## [OnDelete](./on-delete.md)

The OnDelete type defines the callback function that is called when nodes or edges are deleted.

[Read more](./on-delete.md)

## [OnEdgesChange](./on-edges-change.md)

[Read more](./on-edges-change.md)

## [OnEdgesDelete](./on-edges-delete.md)

The OnEdgesDelete type defines the callback function that is called when edges are deleted.

[Read more](./on-edges-delete.md)

## [OnError](./on-error.md)

The OnError type defines the callback function that is called when an error occurs.

[Read more](./on-error.md)

## [OnInit](./on-init.md)

The OnInit type defines the callback function that is called when the ReactFlow instance is initialized.

[Read more](./on-init.md)

## [OnMove](./on-move.md)

Invoked when the viewport is moved, such as by panning or zooming.

[Read more](./on-move.md)

## [OnNodeDrag](./on-node-drag.md)

The OnNodeDrag type defines the callback function that is called when a node is being dragged.

[Read more](./on-node-drag.md)

## [OnNodesChange](./on-nodes-change.md)

[Read more](./on-nodes-change.md)

## [OnNodesDelete](./on-nodes-delete.md)

The OnNodesDelete type defines the callback function that is called when nodes are deleted.

[Read more](./on-nodes-delete.md)

## [OnReconnect](./on-reconnect.md)

Callback function triggered when an existing edge is reconnected to a different node or handle.

[Read more](./on-reconnect.md)

## [OnSelectionChangeFunc](./on-selection-change-func.md)

Called whenever the selection of nodes or edges changes in the flow diagram.

[Read more](./on-selection-change-func.md)

## [PanOnScrollMode](./pan-on-scroll-mode.md)

Configures how the viewport responds to scroll events, allowing free, vertical, or horizontal panning.

[Read more](./pan-on-scroll-mode.md)

## [PanelPosition](./panel-position.md)

This type is mostly used to help position things on top of the flow viewport. For example both the MiniMap and Controls components take a position prop of this type.

[Read more](./panel-position.md)

## [Position](./position.md)

While PanelPosition can be used to place a component in the corners of a container, the Position enum is less precise and used primarily in relation to edges and handles.

[Read more](./position.md)

## [ProOptions](./pro-options.md)

By default, we render a small attribution in the corner of your flows that links back to the project.

[Read more](./pro-options.md)

## [ReactFlowInstance](./react-flow-instance.md)

The ReactFlowInstance provides a collection of methods to query and manipulate the internal state of your flow. You can get an instance by using the useReactFlow hook or attaching a listener to the onInit event.

[Read more](./react-flow-instance.md)

## [ReactFlowJsonObject](./react-flow-json-object.md)

A JSON-compatible representation of your flow. You can use this to save the flow to a database for example and load it back in later.

[Read more](./react-flow-json-object.md)

## [Rect](./rect.md)

The Rect type defines a rectangle with dimensions and a position.

[Read more](./rect.md)

## [ResizeParams](./resize-params.md)

The ResizeParams type is used to type the various events that are emitted by the NodeResizer component. You'll sometimes see this type extended with an additional direction field too.

[Read more](./resize-params.md)

## [SelectionDragHandler](./selection-drag-handler.md)

Handles drag events for selected nodes during interactive operations.

[Read more](./selection-drag-handler.md)

## [SelectionMode](./selection-mode.md)

Controls how nodes are selected in the flow diagram, offering either full or partial selection behavior.

[Read more](./selection-mode.md)

## [SnapGrid](./snap-grid.md)

The SnapGrid type defines the grid size for snapping nodes on the pane.

[Read more](./snap-grid.md)

## [Viewport](./viewport.md)

Internally, React Flow maintains a coordinate system that is independent of the rest of the page. The Viewport type tells you where in that system your flow is currently being display at and how zoomed in or out it is.

[Read more](./viewport.md)

## [XYPosition](./xy-position.md)

All positions are stored in an object with x and y coordinates.

[Read more](./xy-position.md)

## [ZIndexMode](./z-index-mode.md)

The ZIndexMode type is used to define how z-indexing is calculated for nodes and edges.

[Read more](./z-index-mode.md)

Last updated on August 24, 2026

[

useViewport()

](/hooks/use-viewport.md)[

Align

](./align.md)
