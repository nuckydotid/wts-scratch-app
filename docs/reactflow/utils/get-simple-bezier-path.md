---
title: "getSimpleBezierPath()"
description: "The getSimpleBezierPath util returns everything you need to render a simple bezier edge between two nodes."
source: "https://reactflow.dev/api-reference/utils/get-simple-bezier-path"
---

# getSimpleBezierPath()

[Source on Github](https://github.com/xyflow/xyflow/blob/main/packages/react/src/components/Edges/SimpleBezierEdge.tsx/#L32) 

The `getSimpleBezierPath` util returns everything you need to render a simple bezier edge between two nodes.

```tsx
import { Position, getSimpleBezierPath } from "@xyflow/react";

const source = { x: 0, y: 20 };
const target = { x: 150, y: 100 };

const [path, labelX, labelY, offsetX, offsetY] = getSimpleBezierPath({
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

| `[0].sourceX` | `number` | |
| `[0].sourceY` | `number` | |
| `[0].sourcePosition` | `[Position](/api-reference/types/position)` | `[Position](/api-reference/types/position).Bottom` |
| `[0].targetX` | `number` | |
| `[0].targetY` | `number` | |
| `[0].targetPosition` | `[Position](/api-reference/types/position)` | `[Position](/api-reference/types/position).Top` |

**Returns:**

`[path: string, labelX: number, labelY: number, offsetX: number, offsetY: number]`

## Notes

- This function returns a tuple (aka a fixed-size array) to make it easier to work with multiple edge paths at once.

Last updated on August 24, 2026

[

getOutgoers()

](/api-reference/utils/get-outgoers)[

getSmoothStepPath()

](/api-reference/utils/get-smooth-step-path)
