---
title: "getStraightPath()"
description: "Calculates the straight line path between two points."
source: "https://reactflow.dev/api-reference/utils/get-straight-path"
---

# getStraightPath()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/edges/straight-edge.ts/#L30) 

Calculates the straight line path between two points.

```tsx
import { getStraightPath } from "@xyflow/react";

const source = { x: 0, y: 20 };
const target = { x: 150, y: 100 };

const [path, labelX, labelY, offsetX, offsetY] = getStraightPath({
  sourceX: source.x,
  sourceY: source.y,
  targetX: target.x,
  targetY: target.y,
});

console.log(path); //=> "M 0,20L 150,100"
console.log(labelX, labelY); //=> 75, 60
console.log(offsetX, offsetY); //=> 75, 40
```

## Signature

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `[0].sourceX` | `number` The `x` position of the source handle. | |
| `[0].sourceY` | `number` The `y` position of the source handle. | |
| `[0].targetX` | `number` The `x` position of the target handle. | |
| `[0].targetY` | `number` The `y` position of the target handle. | |

**Returns:**

`[path: string, labelX: number, labelY: number, offsetX: number, offsetY: number]`

## Notes

- This function returns a tuple (aka a fixed-size array) to make it easier to work with multiple edge paths at once.

Last updated on August 24, 2026

[

getSmoothStepPath()

](/api-reference/utils/get-smooth-step-path)[

getViewportForBounds()

](/api-reference/utils/get-viewport-for-bounds)
