---
title: "SelectionMode"
description: "Controls how nodes are selected in the flow diagram, offering either full or partial selection behavior."
source: "https://reactflow.dev/api-reference/types/selection-mode"
---

# SelectionMode

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/general.ts#L223) 

The `SelectionMode` enum provides two options for node selection behavior:

- `Full`: A node is only selected when the selection rectangle fully contains it
- `Partial`: A node is selected when the selection rectangle partially overlaps with it

```tsx
enum SelectionMode {
  Partial = "partial",
  Full = "full",
}
```

Last updated on August 24, 2026

[

SelectionDragHandler

](/api-reference/types/selection-drag-handler)[

SnapGrid

](/api-reference/types/snap-grid)
