---
title: "<NodeResizeControl />"
description: "To create your own resizing UI, you can use the NodeResizeControl component where you can pass children (such as icons)."
source: "https://reactflow.dev/api-reference/components/node-resize-control"
---

# <NodeResizeControl />

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/additional-components/NodeResizer/NodeResizeControl.tsx) 

To create your own resizing UI, you can use the `NodeResizeControl` component where you can pass children (such as icons).

## Props

For TypeScript users, the props type for the `<NodeResizeControl />` component is exported as `ResizeControlProps`.

| Name | Type | Default |
| ---- | ---- | ------- |

| `nodeId` | `string` Id of the node it is resizing. | |
| `color` | `string` Color of the resize handle. | |
| `minWidth` | `number` Minimum width of node. | `10` |
| `minHeight` | `number` Minimum height of node. | `10` |
| `maxWidth` | `number` Maximum width of node. | `Number.MAX_VALUE` |
| `maxHeight` | `number` Maximum height of node. | `Number.MAX_VALUE` |
| `keepAspectRatio` | `boolean` Keep aspect ratio when resizing. | `false` |
| `shouldResize` | `(event: ResizeDragEvent, params: ResizeParamsWithDirection) => boolean` Callback to determine if node should resize. | |
| `autoScale` | `boolean` Scale the controls with the zoom level. | `true` |
| `onResizeStart` | `OnResizeStart` Callback called when resizing starts. | |
| `onResize` | `OnResize` Callback called when resizing. | |
| `onResizeEnd` | `OnResizeEnd` Callback called when resizing ends. | |
| `position` | `ControlLinePosition \| 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` Position of the control. | |
| `variant` | `ResizeControlVariant` Variant of the control. | `"handle"` |
| `resizeDirection` | `'horizontal' \| 'vertical'` The direction the user can resize the node. If not provided, the user can resize in any direction. | |
| `className` | `string` | |
| `style` | `[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)` | |
| `children` | `[ReactNode](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/d7e13a7c7789d54cf8d601352517189e82baf502/types/react/index.d.ts#L264)` | |

Last updated on August 24, 2026

[

<MiniMap />

](/api-reference/components/minimap)[

<NodeResizer />

](/api-reference/components/node-resizer)
