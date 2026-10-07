---
name: reactflow-architect
description: React Flow (@xyflow/react) architectural guidelines, node/edge graph configuration, custom nodes, handles, layouting, viewport transforms, and DOM component integration.
---

# React Flow Architect Skill

Use this skill when designing, building, or troubleshooting node-based diagrams, visual workflow builders, DAG pipelines, state machines, and flowchart editors using React Flow (`@xyflow/react` v12).

---

## 📚 Documentation Reference

- **Master API Index & Guides**: `docs/reactflow/README.md`
- **Core Canvas Component**: `docs/reactflow/react-flow.md`
- **Context Provider**: `docs/reactflow/react-flow-provider.md`
- **Components** (`docs/reactflow/components/`):
  - Handles & Connections: `docs/reactflow/components/handle.md`
  - Canvas Overlays: `docs/reactflow/components/background.md`, `docs/reactflow/components/controls.md`, `docs/reactflow/components/minimap.md`, `docs/reactflow/components/panel.md`
  - Node Tools & Resizing: `docs/reactflow/components/node-resizer.md`, `docs/reactflow/components/node-toolbar.md`
  - Edge Customization: `docs/reactflow/components/base-edge.md`, `docs/reactflow/components/edge-label-renderer.md`
- **Hooks** (`docs/reactflow/hooks/`):
  - Canvas Instance: `docs/reactflow/hooks/use-react-flow.md`
  - State Management: `docs/reactflow/hooks/use-nodes-state.md`, `docs/reactflow/hooks/use-edges-state.md`, `docs/reactflow/hooks/use-nodes-data.md`
  - Node & Connection Introspection: `docs/reactflow/hooks/use-handle-connections.md`, `docs/reactflow/hooks/use-node-connections.md`, `docs/reactflow/hooks/use-internal-node.md`
- **Utilities** (`docs/reactflow/utils/`):
  - Edge Routing: `docs/reactflow/utils/get-bezier-path.md`, `docs/reactflow/utils/get-smooth-step-path.md`
  - Graph Traversal: `docs/reactflow/utils/get-incomers.md`, `docs/reactflow/utils/get-outgoers.md`, `docs/reactflow/utils/get-connected-edges.md`

---

## ⚡ Core Rules & Patterns

### 1. Style Import & Parent Dimensions

React Flow **must** have its base stylesheet imported and must be mounted in a parent with explicit width and height:

```tsx
import '@xyflow/react/dist/style.css';

// Container must have dimensions!
<div style={{ width: '100%', height: '100vh' }}>
  <ReactFlow nodes={nodes} edges={edges} ... />
</div>
```

### 2. Node & Edge Type Memoization (Critical)

Never define `nodeTypes` or `edgeTypes` inline inside the component body:

```tsx
// ❌ WRONG - Re-creates object on every render causing all nodes to remount
function Flow() {
  return <ReactFlow nodeTypes={{ custom: CustomNode }} />;
}

// ✅ CORRECT - Defined outside component or memoized
const nodeTypes = {
  custom: CustomNode,
  database: DatabaseNode,
};

function Flow() {
  return <ReactFlow nodeTypes={nodeTypes} />;
}
```

### 3. Custom Node Implementation

Custom nodes receive `NodeProps` (or custom data via generics):

```tsx
import React, { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

export type CustomNodeData = {
  title: string;
  value: number;
};

export type CustomNodeType = Node<CustomNodeData, "custom">;

export const CustomNode = memo(function CustomNode({
  id,
  data,
  selected,
}: NodeProps<CustomNodeType>) {
  return (
    <div
      style={{
        padding: "12px 16px",
        borderRadius: 8,
        background: "#ffffff",
        border: selected ? "2px solid #006fee" : "1px solid #e4e4e7",
        minWidth: 160,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#71717a" }}
      />

      <div style={{ fontWeight: 600, fontSize: 14 }}>{data.title}</div>
      <div style={{ fontSize: 12, color: "#71717a" }}>Value: {data.value}</div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#006fee" }}
      />
    </div>
  );
});
```

### 4. Custom Edge Implementation

Custom edges use `<BaseEdge />` with paths computed via utility functions:

```tsx
import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
              fontSize: 11,
              padding: "2px 6px",
              borderRadius: 4,
              background: "#f4f4f5",
              border: "1px solid #e4e4e7",
            }}
            className="nodrag nopan"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
```

### 5. Drag-and-Drop & Coordinate Conversion

When dragging new nodes onto the canvas from a sidebar:

```tsx
import { useReactFlow } from '@xyflow/react';

function Canvas() {
  const { screenToFlowPosition, setNodes } = useReactFlow();

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const newNode = {
      id: `node_${Date.now()}`,
      type,
      position,
      data: { label: `${type} node` },
    };

    setNodes((nds) => nds.concat(newNode));
  };

  return (
    <div onDrop={onDrop} onDragOver={(e) => e.preventDefault()} style={{ width: '100%', height: '100%' }}>
      <ReactFlow ... />
    </div>
  );
}
```

### 6. Mobile & Expo DOM Component Integration

To render React Flow within an Expo SDK 57 React Native mobile app, isolate it inside an Expo DOM Component (`'use dom';`):

```tsx
// components/flow-canvas-dom.tsx
"use dom";

import React from "react";
import { ReactFlow, Controls, Background } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export default function FlowCanvasDom({
  initialNodes,
  initialEdges,
  onNodeSelect,
}: {
  initialNodes: any[];
  initialEdges: any[];
  onNodeSelect?: (id: string) => void;
}) {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        defaultNodes={initialNodes}
        defaultEdges={initialEdges}
        onNodeClick={(_, node) => onNodeSelect?.(node.id)}
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
```
