# Flows (AI & Agent Map)

Expo SDK 57 **web** app that draws the project's screen-navigation graph with `@xyflow/react` + dagre.

## Commands

- Start web dev server: `bun run start:web` (port 8086)
- Typecheck / lint / format: `bun run typecheck` · `bun run lint` · `bun run format`
- Unit tests: `bun run test` (vitest: layout-tree, flow-colors, entrypoints, focus-node, dependency check)

## Data

- `src/data/screens-tree-data.ts` is the graph (nodes, structural edges, navigation edges). The template ships a small
  hand-authored sample; replace it with the project's own screens.
- Node ids are kebab-case; every node carries a `testID` (`screen-${id}`) so Maestro flows and the canvas agree.
- Categories (`root`, `public`, `admin`, `member`, `staff`, `e2e`) drive colours in `src/utils/flow-colors.ts`, the sidebar
  and the toolbar. Add a category in all three places.

## Rules

- Colours that feed `@xyflow` inline-style APIs live in `src/utils/flow-colors.ts` as raw values; everything else uses
  Tailwind classes.
- Every interactive element gets a `data-testid` from `@repo/worktrees-studio-shared-ids` (`testIds.flow.*`).
- Keep layout logic pure (`src/utils/layout-tree.ts`) and covered by vitest.
