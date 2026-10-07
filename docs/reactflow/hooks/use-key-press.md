---
title: "useKeyPress()"
description: "This hook lets you listen for specific key codes and tells you whether they are currently pressed or not."
source: "https://reactflow.dev/api-reference/hooks/use-key-press"
---

# useKeyPress()

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/react/src/hooks/useKeyPress.ts) 

This hook lets you listen for specific key codes and tells you whether they are currently pressed or not.

```tsx
import { useKeyPress } from "@xyflow/react";

export default function () {
  const spacePressed = useKeyPress("Space");
  const cmdAndSPressed = useKeyPress(["Meta+s", "Strg+s"]);

  return (
    <div>
      {spacePressed && <p>Space pressed!</p>}
      {cmdAndSPressed && <p>Cmd + S pressed!</p>}
    </div>
  );
}
```

## Signature

**Parameters:**

| Name | Type | Default |
| ---- | ---- | ------- |

| `keyCode` | `[KeyCode](/api-reference/types/key-code)` The key code (string or array of strings) specifies which key(s) should trigger an action. A **string** can represent: - A **single key**, e.g. `'a'` - A **key combination**, using `'+'` to separate keys, e.g. `'a+d'` An **array of strings** represents **multiple possible key inputs**. For example, `['a', 'd+s']` means the user can press either the single key `'a'` or the combination of `'d'` and `'s'`. | `null` |
| `options.target` | `Window \| Document \| HTMLElement \| ShadowRoot \| null` Listen to key presses on a specific element. | `document` |
| `options.actInsideInputWithModifier` | `boolean` You can use this flag to prevent triggering the key press hook when an input field is focused. | `true` |
| `options.preventDefault` | `boolean` | |

**Returns:**

`boolean`

## Notes

- This hook does not rely on a `ReactFlowInstance` so you are free to use it anywhere in your app!

Last updated on August 24, 2026

[

useInternalNode()

](/api-reference/hooks/use-internal-node)[

useNodeConnections()

](/api-reference/hooks/use-node-connections)
