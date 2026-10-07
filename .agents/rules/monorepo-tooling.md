# Monorepo Tooling & Workspace Rules

Guidelines for Bun workspaces, root tooling, patches, and scripts.

## Core Commands

- Install dependencies: `bun install`
- Run monorepo typecheck: `bun run typecheck`
- Run monorepo linting: `bun run lint`
- Format code: `bun run format`
- Check format: `bun run format:check`

## Workspace Organization

- `apps/*`: End-user runnable applications (`apps/app`).
- `packages/*`: Shared internal packages (`packages/worktrees-studio-ds`).
- `modules/*`: Native Expo TurboModules (`modules/worktrees-studio-*`).

## Patches & Dependencies

- Patched dependencies are stored in `patches/` and recorded in root `package.json` under `patchedDependencies`.
- If modifying `heroui-native`, verify the patch with `bun --filter '@repo/worktrees-studio-ds' build`.
