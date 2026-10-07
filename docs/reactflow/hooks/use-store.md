---
title: "useStore()"
description: "This hook can be used to subscribe to internal state changes of the React Flow component. The useStore hook is re-exported from the Zustand state management library, so you should check out their docs for more details."
source: "https://reactflow.dev/api-reference/hooks/use-store"
---

# useStore()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useStore.ts) 

This hook can be used to subscribe to internal state changes of the React Flow component. The `useStore` hook is re-exported from the [Zustand](https://github.com/pmndrs/zustand)  state management library, so you should check out their docs for more details.

This hook should only be used if there is no other way to access the internal state. For many of the common use cases, there are dedicated hooks available such as [`useReactFlow`](/api-reference/hooks/use-react-flow), [`useViewport`](/api-reference/hooks/use-viewport), etc.

```tsx
import { ReactFlow, useStore } from '@xyflow/react';

const nodesLengthSelector = (state) =>
  state.nodes.length || 0;

const NodesLengthDisplay = () => {
  const nodesLength = useStore(nodesLengthSelector);

  return <div>The current number of nodes is: {nodesLength}</div>;
};

function Flow() {
  return (
    <ReactFlow nodes={[...]}>
      <NodesLengthDisplay />
    </ReactFlow>
  );
}
```

This example computes the number of nodes eagerly. Whenever the number of nodes in the flow changes, the `<NodesLengthDisplay />` component will re-render. This is in contrast to the example in the [`useStoreApi`](/api-reference/hooks/use-store-api) hook that only computes the number of nodes when a button is clicked.

Choosing whether to calculate values on-demand or to subscribe to changes as they happen is a bit of a balancing act. On the one hand, putting too many heavy calculations in an event handler can make your app feel sluggish or unresponsive. On the other hand, computing values eagerly can lead to slow or unnecessary re-renders.

We make both this hook and [`useStoreApi`](/api-reference/hooks/use-store-api) available so that you can choose the approach that works best for your use-case.

## Signature

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `selector` | `(state: ReactFlowState) => StateSlice` A selector function that returns a slice of the flow’s internal state. Extracting or transforming just the state you need is a good practice to avoid unnecessary re-renders. | |
| `equalityFn` | `(a: StateSlice, b: StateSlice) => boolean` A function to compare the previous and next value. This is incredibly useful for preventing unnecessary re-renders. Good sensible defaults are using `Object.is` or importing `zustand/shallow`, but you can be as granular as you like. | |

**Returns:**

`StateSlice`

## Examples

### Triggering store actions

You can manipulate the internal React Flow state by triggering internal actions through the `useStore` hook. These actions are already used internally throughout the library, but you can also use them to implement custom functionality.

```tsx
import { useStore } from "@xyflow/react";

const setMinZoomSelector = (state) => state.setMinZoom;

function MinZoomSetter() {
  const setMinZoom = useStore(setMinZoomSelector);

  return <button onClick={() => setMinZoom(6)}>set min zoom</button>;
}
```

## TypeScript

This hook can be typed by typing the selector function. See this [section in our TypeScript guide](/learn/advanced-use/typescript#nodetype-edgetype-unions) for more information.

```tsx
const nodes = useStore((s: ReactFlowState<CustomNodeType>) => s.nodes);
```

Last updated on August 24, 2026

[

useReactFlow()

](/api-reference/hooks/use-react-flow)[

useStoreApi()

](/api-reference/hooks/use-store-api)
