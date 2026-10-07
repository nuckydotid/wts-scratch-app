# HeroUI Native Patch Guide

Details regarding the active patch on `heroui-native@1.0.7` in `patches/heroui-native@1.0.7.patch`.

## Purpose of the Patch

The patch bridges compatibility gaps between HeroUI Native v1.0.7 and Tailwind CSS v4 / React 19:

1. **CSS Variable Resolution:** Ensures theme tokens dynamically resolve CSS variables without runtime crashes on React Native web and native runtime.
2. **React 19 Ref Forwarding:** Eliminates deprecated `forwardRef` warnings by utilizing standard React 19 props.
3. **Touch Responder Stability:** Ensures touch events on buttons and interactive overlays trigger deterministically in automated Maestro E2E test runs.

## Verifying the Patch

Run:

```bash
bun --filter '@repo/worktrees-studio-ds' build
```
