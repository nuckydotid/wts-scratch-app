# Expo DOM Components & Recharts Reference

Interactive charting with **Expo DOM Components** (`'use dom';`) and **Recharts** (`recharts@2.15.1`).

---

## 📚 Overview

### Why Expo DOM Components?

Expo DOM Components allow rendering web React components directly in native apps (iOS and Android) via lightweight isolated DOM contexts, and natively in the browser on web.

- **Zero Native C++ GPU Bindings**: Eliminates native GPU library re-initialization issues (e.g. Skia SIGSEGV) during in-process JS runtime reloads (`reactHost.reload()`).
- **Standard Web Ecosystem**: Enables use of rich SVG chart ecosystems like Recharts, complete with responsive containers, interactive tooltips, and cubic Bézier splines.
- **Bilingual & Serialized Props**: Props passed from React Native are cleanly serialized across the bridge.

### Component Structure

- `BlockLineChartDom` (`packages/worktrees-studio-ds/src/components/reusable-blocks/block-line-chart-dom.tsx`): Declares `'use dom';` and renders Recharts `<LineChart>`, `<Line>`, `<XAxis>`, `<YAxis>`, and `<Tooltip>`.
- `BlockLineChart` (`packages/worktrees-studio-ds/src/components/reusable-blocks/block-line-chart.tsx`): Wraps `BlockLineChartDom` and provides HeroUI Native layout primitives (`UiView`, `UiText`, legend badges).
