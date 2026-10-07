---
description: Verify patch-package patches apply cleanly
agent: monorepo-tooling-sheriff
---

<!-- OpenCode command mirror of .agents/workflows/workflow-patch-verify.md. Keep in sync. -->

# Workflow: Package Patches Verification

Verify that custom patches apply cleanly without conflicts:

1. **Test HeroUI Native Patch**:
   Verify `patches/heroui-native@1.0.7.patch` applies cleanly to `node_modules/heroui-native`.

2. **Verify Build & Tests**:
   ```bash
   bun --filter '@repo/worktrees-studio-ds' test:ci
   ```
