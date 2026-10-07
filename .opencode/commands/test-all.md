---
description: Full lint + unit + API + typecheck verification
agent: build
---

<!-- OpenCode command mirror of .agents/workflows/test-all.md. Keep in sync. -->

# Workflow: Monorepo Full Verification

Execute full linting, unit test suites, and typecheck across all packages:

1. **Lint Check**:
   ```bash
   bun run lint
   ```
2. **Design System Unit Tests**:
   ```bash
   bun --filter '@repo/worktrees-studio-ds' test:ci
   ```
3. **App Unit Tests**:
   ```bash
   bun --filter 'app' test:ci
   ```
4. **API Integration Tests**:
   ```bash
   bun --filter 'app' test:api
   ```
5. **TypeScript Check**:
   ```bash
   bun run typecheck
   ```
