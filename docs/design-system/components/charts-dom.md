# Recharts & Expo DOM Components

> Interactive SVG charting components rendered in lightweight Expo DOM Component webviews.

## Import & Usage

```tsx
import { AttendanceAreaChart, GradeBarChart } from "@repo/worktrees-studio-ds";

<AttendanceAreaChart data={attendanceData} />;
```

## Design Tokens & Styling

- Styled exclusively via Tailwind CSS v4 classes and HeroUI Native tokens.
- Fully supports automatic Dark Mode switching.
- Enforces proper `testID` and accessibility attributes (`aria-label`, `aria-hidden`).

## Anti-Patterns

- ❌ Do not apply inline `style={{ ... }}` overrides.
- ❌ Do not hardcode hex color strings.
