# Workflow: Mobile Screen Scaffolding (React 19 & HeroUI Native)

Scaffold a production-grade mobile screen for `app` adhering to React 19 and TanStack Query v5 standards:

1. **Invoke Subagent**:
   Delegate screen construction to `screen-flow-builder`.

2. **TanStack Query v5 Data Layer**:
   - Declare query keys with standard factories in `src/lib/<domain>/keys.ts`.
   - Use `useQuery` / `useInfiniteQuery` (with `initialPageParam`) in `src/lib/<domain>/hooks.ts`.
   - Attach `useRefreshOnFocus` for tab/screen focus synchronization.

3. **React 19 Component Standards**:
   - Use direct `ref` props on inputs and buttons.
   - Use `useActionState` and `useOptimistic` for forms and instant mutations.
   - Ensure all user-facing strings use `useTranslation()` and `WORDINGS` keys.
   - Prevent `set-state-in-effect` by triggering state updates in user event callbacks.

4. **Verify Design Tokens & Localization**:

   ```bash
   python3 .agents/skills/ds-token-auditor/scripts/check_tokens.py
   python3 .agents/skills/i18n-parity-checker/scripts/check_i18n_parity.py
   python3 .agents/skills/tanstack-query-auditor/scripts/audit_query_hooks.py
   ```

5. **Verify TypeScript & Tests**:
   ```bash
   bun run typecheck
   bun --filter 'app' test:ci
   ```
