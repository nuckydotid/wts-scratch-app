---
name: react-standards-auditor
description: Helper skill for auditing React 19 architectural standards (direct ref props, Context rendering, Rules of Hooks, and pure rendering) across the monorepo.
---

# React Standards Auditor Skill

Use this skill to inspect React components and screens for compliance with React 19 standards and the Rules of React.

## Audit Checks

1. Flags `forwardRef` in components and recommends direct `ref` prop passing.
2. Flags `<Context.Provider>` and recommends direct `<Context value={...}>`.
3. Checks for `react-hooks/set-state-in-effect` anti-patterns.
4. Validates that state initializers pass function references rather than invoking them.

## Helper Script

Run `python3 .agents/skills/react-standards-auditor/scripts/audit_react_standards.py`.
