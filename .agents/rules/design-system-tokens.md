# Design System & UI Tokens Rules

Rules for consuming and developing UI components in `packages/worktrees-studio-ds`.

## Framework & Tokens

- **Framework:** HeroUI Native + Tailwind CSS v4.
- **Design Tokens:** Defined in `packages/worktrees-studio-ds/src/theme/tokens.ts` and Tailwind CSS v4 theme config.
- **Export Discipline:** All reusable components must be exported through the package entry point `packages/worktrees-studio-ds/src/index.ts`.

## Charting & DOM Components

- Complex SVG charts must use Expo DOM Components wrapping Recharts (`src/components/charts/`).
- DOM components run in a lightweight web view environment, isolating complex D3/SVG re-renders from the main React Native UI thread.

## AI Safety Rules for Tokens

- **Never** generate hardcoded hex colors or non-theme values.
- If a requested color or spacing does not exist in `packages/worktrees-studio-ds/src/theme/tokens.ts`, **DO NOT** invent a raw value. You must stop and either use the closest available token or ask the Stakeholder if a new token should be added to the design system.
- Always use `ds-token-auditor` to verify generated UI changes.
