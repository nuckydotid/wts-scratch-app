# Package Scoped Rules: worktrees-studio-ds (Design System)

Rules and context for developing in the `@repo/worktrees-studio-ds` design system package.

## Stack & Architecture

- **Framework:** HeroUI Native + Tailwind CSS v4
- **Tokens:** `src/theme/tokens.ts` (Color, Typography, Radii, Spacing)
- **Charts:** Recharts embedded via Expo DOM Components (`src/components/charts/`)
- **Patch:** `patches/heroui-native@1.0.7.patch` applied at monorepo root.

## 🚫 Design System Anti-Patterns

- Never hardcode color values or font sizes inside components; always reference theme tokens.
- Never add unpatched HeroUI Native components that conflict with Tailwind v4 CSS variables.
- All exported components MUST be exported through `src/index.ts`.

## 🛠️ Commands

- Run Tests: `bun run test` (runs once, prints `[done/total · pct%]` progress)
- Watch Tests: `bun run test:watch`
- Changed Tests: `bun run test:changed` (vs `origin/main`)
- Run Typecheck: `bun run typecheck`
- Run Lint: `bun run lint`

## 🧪 RNTL test rule (async fireEvent)

RNTL v14's `fireEvent` (and `userEvent`) return promises that wrap `act`.
**Always `await` them**: an un-awaited press leaves the act queue pending and
every later `render` in the same file mounts an empty tree (root-caused in
#48; `drawer.test.tsx` carries a guard test; the static guard
`src/__tests__/async-event-guard.test.ts` fails on any un-awaited
`fireEvent`/`userEvent` call in app or DS suites, with an inline
`// async-event-ok: reason` escape). New overlay tests should also
assert within the test that opens the overlay when they need pre/post states.

## 🧾 Fullsheet hosting checklist

When a screen gets an `embedded` variant (content inside a fullsheet):

- **Padding:** the sheet owns the outer inset (header + content share `px-5`).
  Embedded bodies render through `SheetScreenBody` and add **no** outer
  padding; `sheet-screen-body.contract.test.ts` fails on `px-`/`p-` tokens in
  an `embedded` branch.
- **Scroll host:** VirtualizedList-backed content (members pickers, search
  lists) must be hosted with `scrollable: false` in `showFullSheet` options;
  the app `sheet-hosting-contract` test guards the chat-room sheets.
- **Footer:** docked actions publish through `BlockSheetActionFooter` +
  `useFullSheetFooterAction({ isBusy, onAction })` — never hand-rolled
  publish effects, and never a second internal submit button (pass
  `showSubmit={false}` when the host docks a footer).
