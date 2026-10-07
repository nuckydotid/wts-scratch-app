---
title: "<NodeToolbar />"
description: "The NodeToolbar component can render a toolbar or tooltip to one side of a custom node. This toolbar doesn't scale with the viewport so that the content is always visible."
source: "https://reactflow.dev/api-reference/components/node-toolbar"
---

# <NodeToolbar />

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/additional-components/NodeToolbar/NodeToolbar.tsx) 

This component can render a toolbar or tooltip to one side of a custom node. This toolbar doesn’t scale with the viewport so that the content is always visible.

```tsx
import { memo } from "react";
import { Handle, Position, NodeToolbar } from "@xyflow/react";

const CustomNode = ({ data }) => {
  return (
    <>
      <NodeToolbar
        isVisible={data.toolbarVisible}
        position={data.toolbarPosition}
      >
        <button>delete</button>
        <button>copy</button>
        <button>expand</button>
      </NodeToolbar>

      <div style={{ padding: "10px 20px" }}>{data.label}</div>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </>
  );
};

export default memo(CustomNode);
```

## Props

For TypeScript users, the props type for the `<NodeToolbar />` component is exported as `NodeToolbarProps`. Additionally, the `<NodeToolbar />` component accepts all props of the HTML `<div />` element.

| Name | Type | Default |
| ---- | ---- | ------- |

| `nodeId` | `string \| string[]` By passing in an array of node id’s you can render a single tooltip for a group or collection of nodes. | |
| `isVisible` | `boolean` If `true`, node toolbar is visible even if node is not selected. | |
| `position` | `[Position](/api-reference/types/position)` Position of the toolbar relative to the node. | `[Position](/api-reference/types/position).Top` |
| `offset` | `number` The space between the node and the toolbar, measured in pixels. | `10` |
| `align` | `[Align](/api-reference/types/align)` Align the toolbar relative to the node. | `"center"` |
| `...props` | `HTMLAttributes<HTMLDivElement>` | |

## Notes

- By default, the toolbar is only visible when a node is selected. If multiple nodes are selected it will not be visible to prevent overlapping toolbars or clutter. You can override this behavior by setting the `isVisible` prop to `true`.

Last updated on August 24, 2026

[

<NodeResizer />

](/api-reference/components/node-resizer)[

<Panel />

](/api-reference/components/panel)
