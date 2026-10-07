# testID Naming Convention

All `testID` values in this codebase must follow a consistent naming pattern so
that Maestro E2E flows, Flashlight performance timelines, and React Native
DevTools inspections remain readable and unambiguous.

## Format

```
<screen-scope>-<element-role>[-<qualifier>]
```

All lowercase with hyphens. No camelCase. No underscores.

## Rules

1. **Screen scope** — prefix with the screen's role, matching the Expo Router
   segment or the DS screen component name abbreviation:
   - `public-login` → public login screens
   - `public-otp` → OTP verification screens
   - `parent-home` → parent home tab
   - `parent-child` → child-related parent screens
   - `teacher-grades` → teacher grades hub
   - `admin-semester` → admin semester detail
   - (etc.)

2. **Element role** — describe what the element does:
   - `btn` for pressable buttons / submit actions
   - `input` for text inputs
   - `card` for list row items
   - `badge` for badge / pill indicators
   - `chip` for chip / tag elements
   - `spinner` for loading indicators
   - `entry` for navigation entry rows
   - `sheet` for bottom sheet containers
   - `header` for navigation bars / headers

3. **Qualifier** (optional) — disambiguates when multiple elements share the
   same role on one screen:
   - `parent-home-scan-btn` vs `parent-home-announcement-btn`
   - `teacher-grades-submit-btn` vs `teacher-grades-next-btn`

## Examples

| Element                         | testID                                                   |
| ------------------------------- | -------------------------------------------------------- |
| Public OTP verify button        | `public-otp-verify-btn`                                  |
| Parent home scan button         | `parent-home-scan-btn`                                   |
| Parent home announcement button | `parent-home-announcement-btn`                           |
| Parent home child card          | `parent-home-child-card`                                 |
| Parent home unread badge        | `parent-home-announcement-badge`                         |
| Family requests entry           | `parent-home-family-requests-entry`                      |
| Form submit button              | `<screen>-submit-btn` (e.g. `admin-semester-submit-btn`) |
| OTP input                       | `public-otp-input`                                       |
| Sign in button                  | `public-login-signin-btn`                                |

## ⚠️ Breaking Change Warning

Renaming any `testID` value **must** be done in a single PR that also updates
all references in:

- `e2e/*.yaml` Maestro flow files
- Any snapshot tests that reference `getByTestId(...)`

Never rename a testID in isolation — always update both sides atomically.

## Anti-Patterns

```tsx
// ❌ No scope prefix
testID = "submit-btn";

// ❌ camelCase
testID = "parentHomeCard";

// ❌ Hardcoded inside a reusable component (breaks when used twice)
function MyCard() {
  return <Pressable testID="my-card" />; // ← hardcoded
}

// ✅ Correct: caller owns the testID
function MyCard({ testID }: { testID?: string }) {
  return <Pressable testID={testID} />;
}
```
