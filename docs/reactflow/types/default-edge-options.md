---
title: "DefaultEdgeOptions"
description: "Many properties on an Edge are optional. When a new edge is created, the properties that are not provided will be filled in with the default values passed to the defaultEdgeOptions prop of the ReactFlow component."
source: "https://reactflow.dev/api-reference/types/default-edge-options"
---

# DefaultEdgeOptions

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/edges.ts/#L88-L89) 

Many properties on an [`Edge`](/api-reference/types/edge) are optional. When a new edge is created, the properties that are not provided will be filled in with the default values passed to the `defaultEdgeOptions` prop of the [`<ReactFlow />`](/api-reference/react-flow#defaultedgeoptions) component.

## Fields

| Name | Type | Default |
| ---- | ---- | ------- |

| `type` | `string \| undefined` Type of edge defined in `edgeTypes`. | |
| `animated` | `boolean` | |
| `hidden` | `boolean` | |
| `deletable` | `boolean` | |
| `selectable` | `boolean` | |
| `data` | `[Record](https://typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)<string, unknown>` Arbitrary data passed to an edge. | |
| `markerStart` | `[EdgeMarkerType](/api-reference/types/edge-marker)` Set the marker on the beginning of an edge. | |
| `markerEnd` | `[EdgeMarkerType](/api-reference/types/edge-marker)` Set the marker on the end of an edge. | |
| `zIndex` | `number` | |
| `ariaLabel` | `string` | |
| `interactionWidth` | `number` ReactFlow renders an invisible path around each edge to make them easier to click or tap on. This property sets the width of that invisible path. | |
| `label` | `[ReactNode](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/d7e13a7c7789d54cf8d601352517189e82baf502/types/react/index.d.ts#L264)` The label or custom element to render along the edge. This is commonly a text label or some custom controls. | |
| `labelStyle` | `[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)` Custom styles to apply to the label. | |
| `labelShowBg` | `boolean` | |
| `labelBgStyle` | `[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)` | |
| `labelBgPadding` | `[number, number]` | |
| `labelBgBorderRadius` | `number` | |
| `style` | `[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)` | |
| `className` | `string` | |
| `reconnectable` | `boolean \| HandleType` Determines whether the edge can be updated by dragging the source or target to a new node. This property will override the default set by the `edgesReconnectable` prop on the `<ReactFlow />` component. | |
| `focusable` | `boolean` | |
| `ariaRole` | `AriaRole` The ARIA role attribute for the edge, used for accessibility. | `"group"` |
| `domAttributes` | `Omit<SVGAttributes<SVGGElement>, "id" \| "style" \| "className" \| "role" \| "aria-label" \| "dangerouslySetInnerHTML">` General escape hatch for adding custom attributes to the edge’s DOM element. | |

Last updated on August 24, 2026

[

CoordinateExtent

](/api-reference/types/coordinate-extent)[

DeleteElements

](/api-reference/types/delete-elements)
