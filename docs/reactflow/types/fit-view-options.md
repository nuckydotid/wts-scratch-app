---
title: "FitViewOptions"
description: "When calling fitView these options can be used to customize the behavior. For example, the duration option can be used to transform the viewport smoothly over a given amount of time."
source: "https://reactflow.dev/api-reference/types/fit-view-options"
---

# FitViewOptions

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/types/general.ts/#L67-L68) 

When calling [`fitView`](/api-reference/types/react-flow-instance#fitview) these options can be used to customize the behavior. For example, the `duration` option can be used to transform the viewport smoothly over a given amount of time.

## Fields

| Name | Type | Default |
| ---- | ---- | ------- |

| `padding` | `Padding` | |
| `includeHiddenNodes` | `boolean` | |
| `minZoom` | `number` | |
| `maxZoom` | `number` | |
| `duration` | `number` | |
| `ease` | `(t: number) => number` | |
| `interpolate` | `"smooth" \| "linear"` | |
| `nodes` | `([NodeType](/api-reference/types/node) \| { id: string; })[]` | |

Last updated on August 24, 2026

[

EdgeTypes

](/api-reference/types/edge-types)[

Handle

](/api-reference/types/handle)
