---
title: "<Background />"
description: "The Background component makes it convenient to render different types of backgrounds common in node-based UIs. It comes with three variants: lines, dots and cross."
source: "https://reactflow.dev/api-reference/components/background"
---

# <Background />

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/additional-components/Background/Background.tsx) 

The `<Background />` component makes it convenient to render different types of backgrounds common in node-based UIs. It comes with three variants: `lines`, `dots` and `cross`.

```tsx
import { useState } from 'react';
import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react';

export default function Flow() {
  return (
    <ReactFlow defaultNodes={[...]} defaultEdges={[...]}>
      <Background color="#ccc" variant={BackgroundVariant.Dots} />
    </ReactFlow>
  );
}
```

## Props

| Name | Type | Default |
| ---- | ---- | ------- |

| `id` | `string` When multiple backgrounds are present on the page, each one should have a unique id. | |
| `color` | `string` Color of the pattern. | |
| `bgColor` | `string` Color of the background. | |
| `className` | `string` Class applied to the container. | |
| `patternClassName` | `string` Class applied to the pattern. | |
| `gap` | `number \| [number, number]` The gap between patterns. Passing in a tuple allows you to control the x and y gap independently. | `20` |
| `size` | `number` The radius of each dot or the size of each rectangle if `BackgroundVariant.Dots` or `BackgroundVariant.Cross` is used. This defaults to 1 or 6 respectively, or ignored if `BackgroundVariant.Lines` is used. | |
| `offset` | `number \| [number, number]` Offset of the pattern. | `0` |
| `lineWidth` | `number` The stroke thickness used when drawing the pattern. | `1` |
| `variant` | `[BackgroundVariant](/api-reference/types/background-variant)` Variant of the pattern. | `[BackgroundVariant](/api-reference/types/background-variant).Dots` |
| `style` | `[CSSProperties](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1545)` Style applied to the container. | |

## Examples

### Combining multiple backgrounds

It is possible to layer multiple `<Background />` components on top of one another to create something more interesting. The following example shows how to render a square grid accented every 10th line.

```tsx
import { ReactFlow, Background, BackgroundVariant } from '@xyflow/react';

import '@xyflow/react/dist/style.css';

export default function Flow() {
  return (
    <ReactFlow defaultNodes={[...]} defaultEdges={[...]}>
      <Background
        id="1"
        gap={10}
        color="#f1f1f1"
        variant={BackgroundVariant.Lines}
      />

      <Background
        id="2"
        gap={100}
        color="#ccc"
        variant={BackgroundVariant.Lines}
      />
    </ReactFlow>
  );
}
```

## Notes

- When combining multiple `<Background />` components it’s important to give each of them a unique `id` prop!

Last updated on August 24, 2026

[Components](/api-reference/components "Components")[

<BaseEdge />

](/api-reference/components/base-edge)
