---
title: "getBezierPath()"
description: "The getBezierPath util returns everything you need to render a bezier edge between two nodes."
source: "https://reactflow.dev/api-reference/utils/get-bezier-path"
---

# getBezierPath()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/utils/edges/bezier-edge.ts/#L95) 

The `getBezierPath` util returns everything you need to render a bezier edge between two nodes.

```tsx
import { Position, getBezierPath } from "@xyflow/react";

const source = { x: 0, y: 20 };
const target = { x: 150, y: 100 };

const [path, labelX, labelY, offsetX, offsetY] = getBezierPath({
  sourceX: source.x,
  sourceY: source.y,
  sourcePosition: Position.Right,
  targetX: target.x,
  targetY: target.y,
  targetPosition: Position.Left,
});

console.log(path); //=> "M0,20 C75,20 75,100 150,100"
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
| `[0].curvature` | `number` The curvature of the bezier edge. | `0.25` |

**Returns:**

`[path: string, labelX: number, labelY: number, offsetX: number, offsetY: number]`

## Notes

- This function returns a tuple (aka a fixed-size array) to make it easier to work with multiple edge paths at once.

Last updated on August 24, 2026

[

applyNodeChanges()

](/api-reference/utils/apply-node-changes)[

getConnectedEdges()

](/api-reference/utils/get-connected-edges)
