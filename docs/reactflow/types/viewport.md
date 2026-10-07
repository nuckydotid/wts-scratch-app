---
title: "Viewport"
description: "Internally, React Flow maintains a coordinate system that is independent of the rest of the page. The Viewport type tells you where in that system your flow is currently being display at and how zoomed in or out it is."
source: "https://reactflow.dev/api-reference/types/viewport"
---

# Viewport

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/general.ts/#L149-L153) 

Internally, React Flow maintains a coordinate system that is independent of the rest of the page. The `Viewport` type tells you where in that system your flow is currently being display at and how zoomed in or out it is.

## Fields

| Name | Type | Default |
| ---- | ---- | ------- |

| `x` | `number` | |
| `y` | `number` | |
| `zoom` | `number` | |

## Notes

- A `Transform` has the same properties as the viewport, but they represent different things. Make sure you don’t get them muddled up or things will start to look weird!

Last updated on August 24, 2026

[

SnapGrid

](/api-reference/types/snap-grid)[

XYPosition

](/api-reference/types/xy-position)
