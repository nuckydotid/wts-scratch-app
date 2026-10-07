---
title: "getViewportForBounds()"
description: "This util returns the viewport for the given bounds. You might use this to pre-calculate the viewport for a given set of nodes on the server or calculate the viewport for the given bounds _without_ changing the viewport directly."
source: "https://reactflow.dev/api-reference/utils/get-viewport-for-bounds"
---

# getViewportForBounds()

[Source on Github](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/general.ts/#L170) 

This util returns the viewport for the given bounds. You might use this to pre-calculate the viewport for a given set of nodes on the server or calculate the viewport for the given bounds _without_ changing the viewport directly.

**Note**

This function was previously called `getTransformForBounds`

```tsx
import { getViewportForBounds } from "@xyflow/react";

const { x, y, zoom } = getViewportForBounds(
  {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  },
  1200,
  800,
  0.5,
  2,
);
```

## Signature

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `bounds` | `[Rect](/api-reference/types/rect)` Bounds to fit inside viewport. | |
| `width` | `number` Width of the viewport. | |
| `height` | `number` Height of the viewport. | |
| `minZoom` | `number` Minimum zoom level of the resulting viewport. | |
| `maxZoom` | `number` Maximum zoom level of the resulting viewport. | |
| `padding` | `Padding` Padding around the bounds. | |

**Returns:**

| Name | Type |
| ---- | ---- |

| `x` | `number` |
| `y` | `number` |
| `zoom` | `number` |

## Notes

- This is quite a low-level utility. You might want to look at the [`fitView`](/api-reference/types/react-flow-instance#fitview) or [`fitBounds`](/api-reference/types/react-flow-instance#fitbounds) methods for a more practical api.

Last updated on August 24, 2026

[

getStraightPath()

](/api-reference/utils/get-straight-path)[

isEdge()

](/api-reference/utils/is-edge)
