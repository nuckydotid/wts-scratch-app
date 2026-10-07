---
title: "OnConnectStart"
description: "Callback function triggered when starting to create a connection between nodes."
source: "https://reactflow.dev/api-reference/types/on-connect-start"
---

# OnConnectStart

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/general.ts#L79) 

The `OnConnectStart` type represents a callback function that is called when starting to create a connection between nodes. It receives the mouse or touch event and information about the source node and handle.

```tsx
type OnConnectStart = (
  event: MouseEvent | TouchEvent,
  params: OnConnectStartParams,
) => void;
```

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `event` | `[MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6) \| TouchEvent` | |
| `params` | `OnConnectStartParams` | |

**Returns:**

`void`

Last updated on August 24, 2026

[

OnConnectEnd

](/api-reference/types/on-connect-end)[

OnDelete

](/api-reference/types/on-delete)
