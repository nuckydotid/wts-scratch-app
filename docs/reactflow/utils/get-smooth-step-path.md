---
title: "getSmoothStepPath()"
description: "The getSmoothStepPath util returns everything you need to render a stepped path between two nodes. The borderRadius property can be used to choose how rounded the corners of those steps are."
source: "https://reactflow.dev/api-reference/utils/get-smooth-step-path"
---

# getSmoothStepPath()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/edges/smoothstep-edge.ts/#L215) 

The `getSmoothStepPath` util returns everything you need to render a stepped path between two nodes. The `borderRadius` property can be used to choose how rounded the corners of those steps are.

```tsx
import { Position, getSmoothStepPath } from "@xyflow/react";

const source = { x: 0, y: 20 };
const target = { x: 150, y: 100 };

const [path, labelX, labelY, offsetX, offsetY] = getSmoothStepPath({
  sourceX: source.x,
  sourceY: source.y,
  sourcePosition: Position.Right,
  targetX: target.x,
  targetY: target.y,
  targetPosition: Position.Left,
});

console.log(path); //=> "M0 20L20 20L 70,20Q 75,20 75,25L 75,95Q ..."
console.log(labelX, labelY); //=> 75, 60
console.log(offsetX, offsetY); //=> 75, 40
```

## Signature

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `[0].sourceX` | `number` The `x` position of the source handle. | |
| `[0].sourceY` | `number` The `y` position of the source handle. | |
| `[0].sourcePosition` | `[Position](/api-reference/types/position)` The position of the source handle. | `[Position](/api-reference/types/position).Bottom` |
| `[0].targetX` | `number` The `x` position of the target handle. | |
| `[0].targetY` | `number` The `y` position of the target handle. | |
| `[0].targetPosition` | `[Position](/api-reference/types/position)` The position of the target handle. | `[Position](/api-reference/types/position).Top` |
| `[0].borderRadius` | `number` | `5` |
| `[0].centerX` | `number` | |
| `[0].centerY` | `number` | |
| `[0].offset` | `number` | `20` |
| `[0].stepPosition` | `number` Controls where the bend occurs along the path. 0 = at source, 1 = at target, 0.5 = midpoint | `0.5` |

**Returns:**

`[path: string, labelX: number, labelY: number, offsetX: number, offsetY: number]`

## Notes

- This function returns a tuple (aka a fixed-size array) to make it easier to work with multiple edge paths at once.
- You can set the `borderRadius` property to `0` to get a step edge path.

Last updated on August 24, 2026

[

getSimpleBezierPath()

](/api-reference/utils/get-simple-bezier-path)[

getStraightPath()

](/api-reference/utils/get-straight-path)
