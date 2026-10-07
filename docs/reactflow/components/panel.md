---
title: "<Panel />"
description: "The Panel component helps you position content above the viewport. It is used internally by the MiniMap and Controls components."
source: "https://reactflow.dev/api-reference/components/panel"
---

# <Panel />

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/components/Panel/index.tsx) 

The `<Panel />` component helps you position content above the viewport. It is used internally by the [`<MiniMap />`](/api-reference/components/minimap) and [`<Controls />`](/api-reference/components/controls) components.

```tsx
import { ReactFlow, Panel } from '@xyflow/react';

export default function Flow() {
  return (
    <ReactFlow nodes={[...]} fitView>
      <Panel position="top-left">top-left</Panel>
      <Panel position="top-center">top-center</Panel>
      <Panel position="top-right">top-right</Panel>
      <Panel position="bottom-left">bottom-left</Panel>
      <Panel position="bottom-center">bottom-center</Panel>
      <Panel position="bottom-right">bottom-right</Panel>
      <Panel position="center-left">center-left</Panel>
      <Panel position="center-right">center-right</Panel>
    </ReactFlow>
  );
}
```

## Props

For TypeScript users, the props type for the `<Panel />` component is exported as `PanelProps`. Additionally, the `<Panel />` component accepts all props of the HTML `<div />` element.

| Name | Type | Default |
| ---- | ---- | ------- |

| `position` | `[PanelPosition](/api-reference/types/panel-position)` The position of the panel. | `"top-left"` |
| `...props` | `DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>` | |

Last updated on August 24, 2026

[

<NodeToolbar />

](/api-reference/components/node-toolbar)[

<ViewportPortal />

](/api-reference/components/viewport-portal)
