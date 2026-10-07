---
title: "<EdgeToolbar />"
description: "The EdgeToolbar component can render a toolbar or tooltip to one side of a custom edge. This toolbar doesn't scale with the viewport so that the content doesn't get too small when zooming out."
source: "https://reactflow.dev/api-reference/components/edge-toolbar"
---

# <EdgeToolbar />

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/additional-components/EdgeToolbar/EdgeToolbar.tsx) 

This component can render a toolbar to one side of a custom edge. This toolbar doesn’t scale with the viewport so that the content doesn’t get too small when zooming out.

```tsx
import { memo } from "react";
import {
  EdgeToolbar,
  BaseEdge,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";

function CustomEdge(props: EdgeProps) {
  const [edgePath, centerX, centerY] = getBezierPath(props);

  return (
    <>
      <BaseEdge id={props.id} path={edgePath} />
      <EdgeToolbar edgeId={props.id} x={centerX} y={centerY} isVisible>
        <button>some button</button>
      </EdgeToolbar>
    </>
  );
}

export default memo(CustomEdge);
```

## Props

| Name | Type | Default |
| ---- | ---- | ------- |

| `x` | `number` The `x` position of the edge toolbar. | |
| `y` | `number` The `y` position of the edge toolbar. | |
| `isVisible` | `boolean` If `true`, edge toolbar is visible even if edge is not selected. | `false` |
| `alignX` | `"left" \| "center" \| "right"` Align the vertical toolbar position relative to the passed x position. | `"center"` |
| `alignY` | `"center" \| "top" \| "bottom"` Align the horizontal toolbar position relative to the passed y position. | `"center"` |
| `edgeId` | `string` An edge toolbar must be attached to an edge. | |
| `...props` | `HTMLAttributes<HTMLDivElement>` | |

## Notes

- By default, the toolbar is only visible when the edge is selected. You can override this behavior by setting the `isVisible` prop to `true`.

Last updated on August 24, 2026

[

<EdgeText />

](/api-reference/components/edge-text)[

<Handle />

](/api-reference/components/handle)
