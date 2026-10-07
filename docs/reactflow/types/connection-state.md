---
title: "ConnectionState"
description: "Data about an ongoing connection."
source: "https://reactflow.dev/api-reference/types/connection-state"
---

# ConnectionState

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/general.ts/#L148-L174) 

The `ConnectionState` type bundles all information about an ongoing connection. It is returned by the [`useConnection`](/api-reference/hooks/use-connection) hook.

```tsx
type NoConnection = {
  inProgress: false;
  isValid: null;
  from: null;
  fromHandle: null;
  fromPosition: null;
  fromNode: null;
  to: null;
  toHandle: null;
  toPosition: null;
  toNode: null;
};
type ConnectionInProgress = {
  inProgress: true;
  isValid: boolean | null;
  from: XYPosition;
  fromHandle: Handle;
  fromPosition: Position;
  fromNode: NodeBase;
  to: XYPosition;
  toHandle: Handle | null;
  toPosition: Position;
  toNode: NodeBase | null;
};

type ConnectionState = ConnectionInProgress | NoConnection;
```

## Fields

| Name | Type | Default |
| ---- | ---- | ------- |

| `inProgress` | `boolean` Indicates whether a connection is currently in progress. | |
| `isValid` | `boolean \| null` If an ongoing connection is above a handle or inside the connection radius, this will be `true` or `false`, otherwise `null`. | |
| `from` | `[XYPosition](/api-reference/types/xy-position) \| null` Returns the xy start position or `null` if no connection is in progress. | |
| `fromHandle` | `[Handle](/api-reference/types/handle) \| null` Returns the start handle or `null` if no connection is in progress. | |
| `fromPosition` | `[Position](/api-reference/types/position) \| null` Returns the side (called position) of the start handle or `null` if no connection is in progress. | |
| `fromNode` | `[NodeType](/api-reference/types/node) \| null` Returns the start node or `null` if no connection is in progress. | |
| `to` | `[XYPosition](/api-reference/types/xy-position) \| null` Returns the xy end position or `null` if no connection is in progress. | |
| `toHandle` | `[Handle](/api-reference/types/handle) \| null` Returns the end handle or `null` if no connection is in progress. | |
| `toPosition` | `[Position](/api-reference/types/position) \| null` Returns the side (called position) of the end handle or `null` if no connection is in progress. | |
| `toNode` | `[NodeType](/api-reference/types/node) \| null` Returns the end node or `null` if no connection is in progress. | |
| `pointer` | `[XYPosition](/api-reference/types/xy-position) \| null` Returns the pointer position or `null` if no connection is in progress. | |

Last updated on August 24, 2026

[

ConnectionMode

](/api-reference/types/connection-mode)[

CoordinateExtent

](/api-reference/types/coordinate-extent)
