---
title: "<EdgeLabelRenderer />"
description: "Edges are SVG-based. If you want to render more complex labels you can use the EdgeLabelRenderer component to access a div based renderer. This component is a portal that renders the label in a div that is positioned on top of the edges. You can see an example usage of the component in the edge label renderer example."
source: "https://reactflow.dev/api-reference/components/edge-label-renderer"
---

# <EdgeLabelRenderer />

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/components/EdgeLabelRenderer/index.tsx) 

Edges are SVG-based. If you want to render more complex labels you can use the `<EdgeLabelRenderer />` component to access a div based renderer. This component is a portal that renders the label in a `<div />` that is positioned on top of the edges. You can see an example usage of the component in the [edge label renderer](/examples/edges/edge-label-renderer) example.

```tsx
import React from "react";
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from "@xyflow/react";

const CustomEdge = ({ id, data, ...props }) => {
  const [edgePath, labelX, labelY] = getBezierPath(props);

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: "#ffcc00",
            padding: 10,
            borderRadius: 5,
            fontSize: 12,
            fontWeight: 700,
          }}
          className="nodrag nopan"
        >
          {data.label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
```

## Props

| Name | Type | Default |
| ---- | ---- | ------- |

| `children` | `[ReactNode](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/d7e13a7c7789d54cf8d601352517189e82baf502/types/react/index.d.ts#L264)` | |

## Notes

- The `<EdgeLabelRenderer />` has no pointer events by default. If you want to add mouse interactions you need to set the style `pointerEvents: 'all'` and add the `nopan` class on the label or the element you want to interact with.

Last updated on August 24, 2026

[

<Controls />

](/api-reference/components/controls)[

<EdgeText />

](/api-reference/components/edge-text)
