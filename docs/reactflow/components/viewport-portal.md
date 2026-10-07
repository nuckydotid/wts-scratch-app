---
title: "<ViewportPortal />"
description: "The ViewportPortal component can be used to add components to the same viewport of the flow where nodes and edges are rendered. This is useful when you want to render your own components that are adhere to the same coordinate system as the nodes & edges and are also affected by zooming and panning"
source: "https://reactflow.dev/api-reference/components/viewport-portal"
---

# <ViewportPortal />

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/components/ViewportPortal/index.tsx) 

`<ViewportPortal />` component can be used to add components to the same viewport of the flow where nodes and edges are rendered. This is useful when you want to render your own components that adhere to the same coordinate system as the nodes & edges and are also affected by zooming and panning

```tsx
import React from "react";
import { ViewportPortal } from "@xyflow/react";

export default function () {
  return (
    <ViewportPortal>
      <div
        style={{ transform: "translate(100px, 100px)", position: "absolute" }}
      >
        This div is positioned at [100, 100] on the flow.
      </div>
    </ViewportPortal>
  );
}
```

## Props

| Name | Type | Default |
| ---- | ---- | ------- |

| `children` | `[ReactNode](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/d7e13a7c7789d54cf8d601352517189e82baf502/types/react/index.d.ts#L264)` | |

Last updated on August 24, 2026

[

<Panel />

](/api-reference/components/panel)[Hooks](/api-reference/hooks "Hooks")
