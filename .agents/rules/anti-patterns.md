# Global Anti-Patterns & Negative Constraints

Apply these strict rules across the entire Worktrees Studio monorepo. Violating any of these rules results in broken builds or failed tests.

## 🚫 Strictly Forbidden Practices

1. **Package Management:**
   - ❌ NEVER use `npm`, `yarn`, `pnpm`, or `npx` for installing packages or running scripts.
   - ✅ ALWAYS use `bun` (e.g., `bun add`, `bun run`, `bunx`).

2. **Styling & UI Tokens:**
   - ❌ NEVER use inline hex colors (e.g., `#FFFFFF`, `#1E293B`) or hardcoded pixel spacing.
   - ❌ NEVER use React Native `StyleSheet.create()` unless wrapping raw native canvas or low-level primitives.
   - ✅ ALWAYS use Tailwind CSS v4 utility classes and HeroUI Native design tokens from `@repo/worktrees-studio-ds`.

3. **Routing & Navigation:**
   - ❌ NEVER import from `@react-navigation/native` or instantiate React Navigation stack/tab navigators directly.
   - ✅ ALWAYS use Expo Router v57 file-based typed routes (`useRouter()`, `router.push('/(auth)/login')`, `<Link href="...">`).

4. **API Calls & Backend Contracts:**
   - ❌ NEVER construct unstructured raw `fetch()` or `axios` calls to the Hono API.
   - ✅ ALWAYS use the typed Hono RPC client (`client.api.v1...`) exported from `@repo/app/api`.

5. **State Management & Persistence:**
   - ❌ NEVER use `AsyncStorage` or browser `localStorage`.
   - ✅ ALWAYS use Zustand v5 with `@repo/worktrees-studio-mmkv` synchronous storage engine for persistence.

6. **Git & Release Management:**
   - ❌ NEVER execute destructive commands: `git reset --hard`, `git clean -fd`, `git push --force`.
   - ✅ ALWAYS follow Conventional Commits enforced by Commitlint.
