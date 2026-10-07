---
title: "<Controls />"
description: "The Controls component renders a small panel that contains convenient buttons to zoom in, zoom out, fit the view, and lock the viewport."
source: "https://reactflow.dev/api-reference/components/controls"
---

# <Controls />

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/additional-components/Controls/Controls.tsx) 

The `<Controls />` component renders a small panel that contains convenient buttons to zoom in, zoom out, fit the view, and lock the viewport.

```tsx
import { ReactFlow, Controls } from '@xyflow/react'

export default function Flow() {
  return (
    <ReactFlow nodes={[...]} edges={[...]}>
      <Controls />
    </ReactFlow>
  )
}
```

## Props

For TypeScript users, the props type for the `<Controls />` component is exported as `ControlProps`.

| Name | Type | Default |
| ---- | ---- | ------- |

| `showZoom` | `boolean` Whether or not to show the zoom in and zoom out buttons. These buttons will adjust the viewport zoom by a fixed amount each press. | `true` |
| `showFitView` | `boolean` Whether or not to show the fit view button. By default, this button will adjust the viewport so that all nodes are visible at once. | `true` |
| `showInteractive` | `boolean` Show button for toggling interactivity | `true` |
| `fitViewOptions` | `FitViewOptionsBase<[NodeType](/api-reference/types/node)>` Customise the options for the fit view button. These are the same options you would pass to the fitView function. | |
| `onZoomIn` | `() => void` Called in addition the default zoom behavior when the zoom in button is clicked. | |
| `onZoomOut` | `() => void` Called in addition the default zoom behavior when the zoom out button is clicked. | |
| `onFitView` | `() => void` Called when the fit view button is clicked. When this is not provided, the viewport will be adjusted so that all nodes are visible. | |
| `onInteractiveChange` | `(interactiveStatus: boolean) => void` Called when the interactive (lock) button is clicked. | |
| `position` | `[PanelPosition](/api-reference/types/panel-position)` Position of the controls on the pane | `[PanelPosition](/api-reference/types/panel-position).BottomLeft` |
| `children` | `[ReactNode](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/d7e13a7c7789d54cf8d601352517189e82baf502/types/react/index.d.ts#L264)` | |
| `style` | `[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)` Style applied to container | |
| `className` | `string` Class name applied to container | |
| `aria-label` | `string` | `'React Flow controls'` |
| `orientation` | `"horizontal" \| "vertical"` | `'vertical'` |

## Notes

- To extend or customize the controls, you can use the [`<ControlButton />`](/api-reference/components/control-button) component

Last updated on August 24, 2026

[

<ControlButton />

](/api-reference/components/control-button)[

<EdgeLabelRenderer />

](/api-reference/components/edge-label-renderer)
