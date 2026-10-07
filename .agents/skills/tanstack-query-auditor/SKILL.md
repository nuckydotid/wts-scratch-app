---
name: tanstack-query-auditor
description: Helper skill for auditing TanStack React Query v5 query keys, mutation invalidations, and caching patterns across the mobile app.
---

# TanStack Query Auditor Skill

Use this skill to inspect React Query hooks in `apps/app/src/lib/` and `src/hooks/` for compliance with v5 best practices.

## Audit Checks

1. Verifies query keys use array formatting and key factories.
2. Checks that mutations include `queryClient.invalidateQueries` in `onSuccess` or `onSettled`.
3. Verifies that `useInfiniteQuery` includes `initialPageParam`.
4. Scans for duplicate state storage anti-patterns (`useState` mirroring `useQuery` data).
5. Verifies that dynamic list queries and search queries specify `placeholderData: keepPreviousData` to ensure React Native touch gesture and layout stability.

## Helper Script

Run `python3 .agents/skills/tanstack-query-auditor/scripts/audit_query_hooks.py`.
