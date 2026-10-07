---
title: "PanelPosition"
description: "This type is mostly used to help position things on top of the flow viewport. For example both the MiniMap and Controls components take a position prop of this type."
source: "https://reactflow.dev/api-reference/types/panel-position"
---

# PanelPosition

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/general.ts/#L111-L112) 

This type is mostly used to help position things on top of the flow viewport. For example both the [`<MiniMap />`](/api-reference/components/minimap) and [`<Controls />`](/api-reference/components/controls) components take a `position` prop of this type.

```tsx
export type PanelPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "center-left"
  | "center-right";
```

Last updated on August 24, 2026

[

PanOnScrollMode

](/api-reference/types/pan-on-scroll-mode)[

Position

](/api-reference/types/position)
