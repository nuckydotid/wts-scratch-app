---
title: "<EdgeText />"
description: "You can use the EdgeText component as a helper component to display text within your custom edges."
source: "https://reactflow.dev/api-reference/components/edge-text"
---

# <EdgeText />

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/components/Edges/EdgeText.tsx) 

You can use the `<EdgeText />` component as a helper component to display text within your custom edges.

```tsx
import { EdgeText } from "@xyflow/react";

export function CustomEdgeLabel({ label }) {
  return (
    <EdgeText
      x={100}
      y={100}
      label={label}
      labelStyle={{ fill: "white" }}
      labelShowBg
      labelBgStyle={{ fill: "red" }}
      labelBgPadding={[2, 4]}
      labelBgBorderRadius={2}
    />
  );
}
```

## Props

For TypeScript users, the props type for the `<EdgeText />` component is exported as `EdgeTextProps`.

| Name | Type | Default |
| ---- | ---- | ------- |

| `x` | `number` The x position where the label should be rendered. | |
| `y` | `number` The y position where the label should be rendered. | |
| `label` | `[ReactNode](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/d7e13a7c7789d54cf8d601352517189e82baf502/types/react/index.d.ts#L264)` The label or custom element to render along the edge. This is commonly a text label or some custom controls. | |
| `labelStyle` | `[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)` Custom styles to apply to the label. | |
| `labelShowBg` | `boolean` | |
| `labelBgStyle` | `[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)` | |
| `labelBgPadding` | `[number, number]` | |
| `labelBgBorderRadius` | `number` | |
| `...props` | `Omit<SVGAttributes<SVGElement>, "x" \| "y">` | |

Additionally, you may also pass any standard React HTML attributes such as `onClick`, `className` and so on.

Last updated on August 24, 2026

[

<EdgeLabelRenderer />

](/api-reference/components/edge-label-renderer)[

<EdgeToolbar />

](/api-reference/components/edge-toolbar)
