# React 19 & Expo Router v57 Rules

Rules for mobile client development in `apps/app`.

## React 19 Conventions

- Use `useActionState` and `useOptimistic` for form actions and transitions.
- Do NOT use `forwardRef`; React 19 accepts `ref` as a standard prop.
- Do NOT use `useMemo` or `useCallback` for trivial computations; rely on the React compiler standards and proper component boundaries.

## Expo Router v57 & SDK 57

- File-based routing located under `apps/app/app/`.
- Use typed router navigation: `router.push('/(tabs)/dashboard')`, `router.replace('/(auth)/login')`.
- Zero-retry deterministic E2E: Ensure all interactive components have explicit `testID` props.
- Translations: All user-facing strings must use `useTranslation()` from the i18n dictionary (`id` / `en`).
