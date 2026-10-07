---
title: "OnConnectEnd"
description: "Callback function triggered when finishing or canceling a connection attempt between nodes."
source: "https://reactflow.dev/api-reference/types/on-connect-end"
---

# OnConnectEnd

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/general.ts#L89) 

The `OnConnectEnd` type represents a callback function that is called when finishing or canceling a connection attempt. It receives the mouse or touch event and the final state of the connection attempt.

```tsx
type OnConnectEnd = (
  event: MouseEvent | TouchEvent,
  connectionState: FinalConnectionState,
) => void;
```

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `event` | `[MouseEvent](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/61c7bb49838a155b2b0476bb97d5e707ca80a23b/types/react/v17/index.d.ts#L1226C6-L1226C6) \| TouchEvent` | |
| `connectionState` | `FinalConnectionState<InternalNodeBase<[NodeType](/api-reference/types/node)>>` | |

**Returns:**

`void`

Last updated on August 24, 2026

[

OnConnect

](/api-reference/types/on-connect)[

OnConnectStart

](/api-reference/types/on-connect-start)
