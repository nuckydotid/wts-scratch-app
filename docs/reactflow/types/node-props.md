---
title: "NodeProps<T>"
description: "When you implement a custom node it is wrapped in a component that enables basic functionality like selection and dragging. Your custom node receives the following props:"
source: "https://reactflow.dev/api-reference/types/node-props"
---

# NodeProps<T>

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/nodes.ts/#L89) 

When you implement a [custom node](/learn/customization/custom-nodes) it is wrapped in a component that enables basic functionality like selection and dragging.

## Usage

```tsx
import { useState } from "react";
import { NodeProps, Node } from "@xyflow/react";

export type CounterNode = Node<
  {
    initialCount?: number;
  },
  "counter"
>;

export default function CounterNode(props: NodeProps<CounterNode>) {
  const [count, setCount] = useState(props.data?.initialCount ?? 0);

  return (
    <div>
      <p>Count: {count}</p>
      <button className="nodrag" onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

Remember to register your custom node by adding it to the [`nodeTypes`](/api-reference/react-flow#nodetypes) prop of your `<ReactFlow />` component.

```tsx
import { ReactFlow } from '@xyflow/react';
import CounterNode from './CounterNode';

const nodeTypes = {
  counterNode: CounterNode,
};

export default function App() {
  return <ReactFlow nodeTypes={nodeTypes} ... />
}
```

You can read more in our [custom node guide](/learn/customization/custom-nodes).

## Fields

Your custom node receives the following props:

| Name | Type | Default |
| ---- | ---- | ------- |

| `id` | `[NodeType](/api-reference/types/node)["id"]` Unique id of a node. | |
| `data` | `[NodeType](/api-reference/types/node)["data"]` Arbitrary data passed to a node. | |
| `width` | `[NodeType](/api-reference/types/node)["width"]` | |
| `height` | `[NodeType](/api-reference/types/node)["height"]` | |
| `sourcePosition` | `[NodeType](/api-reference/types/node)["sourcePosition"]` Only relevant for default, source, target nodeType. Controls source position. | |
| `targetPosition` | `[NodeType](/api-reference/types/node)["targetPosition"]` Only relevant for default, source, target nodeType. Controls target position. | |
| `dragHandle` | `[NodeType](/api-reference/types/node)["dragHandle"]` A class name that can be applied to elements inside the node that allows those elements to act as drag handles, letting the user drag the node by clicking and dragging on those elements. | |
| `parentId` | `[NodeType](/api-reference/types/node)["parentId"]` Parent node id, used for creating sub-flows. | |
| `type` | `[NodeType](/api-reference/types/node)["type"]` Type of node defined in nodeTypes | |
| `dragging` | `[NodeType](/api-reference/types/node)["dragging"]` Whether or not the node is currently being dragged. | |
| `zIndex` | `[NodeType](/api-reference/types/node)["zIndex"]` | |
| `selectable` | `[NodeType](/api-reference/types/node)["selectable"]` | |
| `deletable` | `[NodeType](/api-reference/types/node)["deletable"]` | |
| `selected` | `[NodeType](/api-reference/types/node)["selected"]` | |
| `draggable` | `[NodeType](/api-reference/types/node)["draggable"]` Whether or not the node is able to be dragged. | |
| `isConnectable` | `boolean` Whether a node is connectable or not. | |
| `positionAbsoluteX` | `number` Position absolute x value. | |
| `positionAbsoluteY` | `number` Position absolute y value. | |

Last updated on August 24, 2026

[

NodeOrigin

](/api-reference/types/node-origin)[

NodeTypes

](/api-reference/types/node-types)
