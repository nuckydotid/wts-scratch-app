---
title: "<Handle />"
description: "The Handle component is used in your custom nodes to define connection points."
source: "https://reactflow.dev/api-reference/components/handle"
---

# <Handle />

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/components/Handle/index.tsx) 

The `<Handle />` component is used in your [custom nodes](/learn/customization/custom-nodes) to define connection points.

```tsx
import { Handle, Position } from "@xyflow/react";

export const CustomNode = ({ data }) => {
  return (
    <>
      <div style={{ padding: "10px 20px" }}>{data.label}</div>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </>
  );
};
```

## Props

For TypeScript users, the props type for the `<Handle />` component is exported as `HandleProps`.

| Name | Type | Default |
| ---- | ---- | ------- |

| `id` | `string \| null` Id of the handle. | |
| `type` | `'source' \| 'target'` Type of the handle. | `"source"` |
| `position` | `[Position](/api-reference/types/position)` The position of the handle relative to the node. In a horizontal flow source handles are typically `Position.Right` and in a vertical flow they are typically `Position.Top`. | `[Position](/api-reference/types/position).Top` |
| `isConnectable` | `boolean` Should you be able to connect to/from this handle. | `true` |
| `isConnectableStart` | `boolean` Dictates whether a connection can start from this handle. | `true` |
| `isConnectableEnd` | `boolean` Dictates whether a connection can end on this handle. | `true` |
| `isValidConnection` | `[IsValidConnection](/api-reference/types/is-valid-connection)` Called when a connection is dragged to this handle. You can use this callback to perform some custom validation logic based on the connection target and source, for example. Where possible, we recommend you move this logic to the `isValidConnection` prop on the main ReactFlow component for performance reasons. | |
| `onConnect` | `[OnConnect](/api-reference/types/on-connect)` Callback called when connection is made | |
| `...props` | `Omit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "id">` | |

Last updated on August 24, 2026

[

<EdgeToolbar />

](/api-reference/components/edge-toolbar)[

<MiniMap />

](/api-reference/components/minimap)
