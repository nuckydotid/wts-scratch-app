---
title: "<ControlButton />"
description: "You can add buttons to the control panel by using the ControlButton component and pass it as a child to the Controls component."
source: "https://reactflow.dev/api-reference/components/control-button"
---

# <ControlButton />

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/additional-components/Controls/ControlButton.tsx) 

You can add buttons to the control panel by using the `<ControlButton />` component and pass it as a child to the [`<Controls />`](/api-reference/components/controls) component.

```tsx
import { MagicWand } from '@radix-ui/react-icons'
import { ReactFlow, Controls, ControlButton } from '@xyflow/react'

export default function Flow() {
  return (
    <ReactFlow nodes={[...]} edges={[...]}>
      <Controls>
        <ControlButton onClick={() => alert('Something magical just happened. ✨')}>
          <MagicWand />
        </ControlButton>
      </Controls>
    </ReactFlow>
  )
}
```

## Props

The `<ControlButton />` component accepts any prop valid on a HTML `<button />` element.

| Name | Type | Default |
| ---- | ---- | ------- |

| `...props` | `ButtonHTMLAttributes<HTMLButtonElement>` | |

Last updated on August 24, 2026

[

<BaseEdge />

](/api-reference/components/base-edge)[

<Controls />

](/api-reference/components/controls)
