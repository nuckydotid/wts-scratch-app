---
title: "OnError"
description: "The OnError type defines the callback function that is called when an error occurs."
source: "https://reactflow.dev/api-reference/types/on-error"
---

# OnError

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/general.ts#L233) 

The `OnError` type defines the callback function that is called when an error occurs. This callback receives an error id and the error message as its argument.

```tsx
type OnError = (id: string, error: string) => void;
```

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `id` | `string` | |
| `message` | `string` | |

**Returns:**

`void`

Last updated on August 24, 2026

[

OnEdgesDelete

](/api-reference/types/on-edges-delete)[

OnInit

](/api-reference/types/on-init)
