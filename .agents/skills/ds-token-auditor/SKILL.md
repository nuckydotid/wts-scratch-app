---
name: ds-token-auditor
description: Linter and auditor skill ensuring all React Native screens strictly consume @repo/worktrees-studio-ds design tokens and avoid hardcoded un-themed styling.
---

# Design System Token Auditor Skill

Use this skill to audit UI files and detect raw un-themed CSS properties, hardcoded hex colors, or improper font usages.

## Helper Script

Run `python3 .agents/skills/ds-token-auditor/scripts/check_tokens.py <file-or-dir>` to lint styling tokens.
