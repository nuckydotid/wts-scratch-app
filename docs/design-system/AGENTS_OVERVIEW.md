# Design System Guide

## Project Structure

```
src/
├── app/                      # Expo Router pages (storybook)
├── components/
│   ├── index.ts              # Barrel: re-exports everything
│   ├── heroui-primitive/     # Ui* wrapper dirs (UiView, UiText, UiButton, etc.)
│   ├── template/             # TemplateScrollableScreen, TemplateFlatListScreen
│   ├── reusable-blocks/      # BlockScreenHeader, BlockGroupedList (rows via .Row / items), etc.
│   ├── screens/              # PublicLoginScreen, AdminTeachersScreen (full-page compositions)
│   ├── providers/            # ThemeProvider
│   └── teleport/             # TeleportProvider (bottom sheet, toast, drawer)
├── lib/
│   └── asset-url.ts          # getAssetUrl() + ensureAssetsCached()
├── expo-story/
│   ├── items/
│   │   ├── heroui-primitive/ # ComponentDef for each primitive (with controls)
│   │   ├── teleport/         # ComponentDef for teleport blocks
│   │   ├── reusable-blocks/  # ComponentDef for reusable blocks
│   │   ├── template/         # ComponentDef for template preview
│   │   └── screens/          # ComponentDef for screen preview (with controls)
│   └── layouts/              # Sidebar, toolbar, phone-frame, drag-canvas, controls
├── hooks/                    # use-controls, use-font, use-theme
└── global.css                # Tailwind v4 + Uniwind + HeroUI styles
```

## File Naming

| Type                     | Pattern                                                      | Example                                                   |
| ------------------------ | ------------------------------------------------------------ | --------------------------------------------------------- |
| Wrapper component        | `*.component.tsx` + `index.ts`                               | `button.component.tsx`                                    |
| Template component       | Flat `*.tsx`                                                 | `template-flat-list-screen.tsx`                           |
| Reusable block           | `block-*.tsx`                                                | `block-list-item.tsx`                                     |
| Screen                   | `{audience}-{subject}-screen.tsx`                            | `admin-teachers-screen.tsx`                               |
| Screen-level sheet/parts | `{audience}-{subject}-*-sheet.tsx`, `{audience}-*-parts.tsx` | `teacher-task-form-sheet.tsx`, `profile-screen-parts.tsx` |
| Story block (expo-story) | `*.expo-story.tsx`                                           | `block-list-item.expo-story.tsx`                          |
| Layout component         | Flat `*.tsx`                                                 | `sidebar.tsx`, `toolbar.tsx`                              |
| Test file                | `__tests__/*-test.tsx`                                       | `__tests__/text-test.tsx`                                 |

Sheets and internal part files live in `screens/` next to their screens (they are full-screen
compositions or shared screen internals, not reusable blocks) but still carry an audience prefix.

## Naming Conventions

| Section          | Prefix     | Export Example               | Category in sidebar |
| ---------------- | ---------- | ---------------------------- | ------------------- |
| heroui-primitive | `UI`       | `UiButton`                   | "heroui-primitive"  |
| template         | `Template` | `TemplateFlatListScreen`     | "templates"         |
| reusable block   | `Block`    | `BlockGroupedList`           | "reusable blocks"   |
| screen (public)  | `Public`   | `PublicLoginScreen`          | "screens"           |
| screen (admin)   | `Admin`    | `AdminTeachersScreen`        | "screens"           |
| screen (teacher) | `Teacher`  | `TeacherStudentReportScreen` | "screens"           |
| screen (parent)  | `Parent`   | `ParentStudentReportScreen`  | "screens"           |

## Strict Role Separation Rule

- **Every role has dedicated screens and APIs**: Each audience (`admin`, `teacher`, `parent`, `public`) must have its own dedicated screen components in `screens/` (`Admin*`, `Teacher*`, `Parent*`, `Public*`).
- **Never cross-import or alias screens across roles**: Even if two roles share a visually similar layout (e.g. Teacher Student Report vs Parent Student Report), they must remain separate screen files with their own dedicated props, text contracts, and permissions.
- **Share UI via Reusable Blocks**: Common UI patterns, rows, cards, and layouts are abstracted into `reusable-blocks/` (`BlockNavBar`, `BlockGroupedList`, `BlockIdCard`, `BlockProfileHeader`, `BlockChatInput`, `BlockEmptyState`, `BlockRetry`, `UiSkeleton`, etc.) and composed within each role's screen.
- **Client App Role Separation**: In host applications (`app`, `worktrees-studio-school`), host screens in `src/screens/{role}/` must strictly import only their role's DS screen component and their role's API hooks (`@/lib/{role}/hooks.ts`).

## Imports

- Always import from `@/components` barrel for Ui* wrappers
- Never import from `heroui-native/*` directly
- Never import from `react-native` for components (use UiView, UiText, etc.)

## Styling

- Use Tailwind v4 `className` with HeroUI semantic tokens:
  `bg-background`, `bg-surface`, `bg-field`, `text-foreground`, `text-muted`, `text-accent`, `border-separator`
- Dark mode via `.dark` class on `<html>` + CSS variables
- Avoid inline `style` objects for theming
- **Primitives render through their variant system — never override a primitive's colors with custom `className` values** (e.g. no `bg-white`/`text-accent` on a `UiButton`). Pick the built-in variant (`primary`/`secondary`/`tertiary`/`outline`/`ghost`/…) and let the Label inherit its text color; match companion icons to the variant's **label** color token via `useCSSVariable` (the label is the color authority — e.g. heroui `secondary` labels use `--color-accent-soft-foreground`, so the icon must use that exact token, never a look-alike). Layout-only classes (`w-full`, `max-w-xs`, `flex-1`) are fine on primitives. If a variant is missing, propose it in the DS — do not fake it with className
- Reusable blocks may style their internal layout with className; the _color_ of primitive chrome (buttons, inputs) stays variant/token-driven

## Template Components (`src/components/template/`)

Structural wrappers for consistent screen layout. Plain React components (no ComponentDef).

**Every screen must start with a `Template` — never raw `<View className="flex-1">`.**

**Scroll indicators are hidden on every scroll surface** — `UiScrollView`/`UiFlatList` hide them by default, and the template/teleport scroll views (`TemplateScrollableScreen`, `TeleportFullSheetView`'s keyboard-aware scroll, date-picker) set `showsVerticalScrollIndicator={false}`. Host code must not add raw `ScrollView`/`FlatList` with visible indicators.

| Component                             | Props                                          | Purpose                                                                                                                                                                                            |
| ------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TemplateScrollableScreen`            | `children`, `header?`, `footer?`, `onRefresh?` | Scrollable screen with padding + fixed header/footer; **keyboard-aware on native** (`KeyboardAwareScrollView`), plain scroll on web                                                                |
| `TemplateFlatListScreen`              | see table below                                | FlatList shell with loading/error/empty/refresh states                                                                                                                                             |
| `TemplateSearchableSectionListScreen` | see section below                              | Sectioned list shell with a search field (700ms debounced `onSearchChange`), end-reached pagination, loading/error/empty/refresh — the engine behind `BlockSearchableSelectSheet` and browse lists |

### TemplateScrollableScreen

```tsx
<TemplateScrollableScreen
  header={<BlockNavBar title="Screen Title" showBack onPressBack={...} />}
  footer={<UiText className="text-xs text-muted text-center px-5 pb-4">v2.0.9</UiText>}
  onRefresh={onRefresh}
>
  <BlockScreenHeader title="Welcome" subtitle="..." />
  <BlockEmailForm ... />
</TemplateScrollableScreen>
```

`header` and `footer` are rendered as-is — each block owns its own styling (padding, alignment, background). Content scrolls independently between them.

### TemplateFlatListScreen

| Prop                                       | Type                         | Purpose                                                                                                                                                           |
| ------------------------------------------ | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data`                                     | `T[]`                        | List data                                                                                                                                                         |
| `keyExtractor`                             | `(item, index) => string`    | List keys                                                                                                                                                         |
| `renderItem`                               | `(item, index) => ReactNode` | Receives index for first/last radius math                                                                                                                         |
| `ItemSeparatorComponent`                   | `ReactNode`                  | Between rows (see List Pattern: `<UiView className="h-px" />`)                                                                                                    |
| `header?` / `footer?`                      | `ReactNode`                  | Outside the list (header above, footer below)                                                                                                                     |
| `ListHeaderComponent?`                     | `ReactNode`                  | Inside the list, scrolls with content (e.g. filter card)                                                                                                          |
| `ListFooterComponent?`                     | `ReactNode`                  | Inside the list (infinite-scroll spinner footer)                                                                                                                  |
| `onRefresh?`                               | `() => void`                 | Pull-to-refresh (accent spinner)                                                                                                                                  |
| `onEndReached?` / `onEndReachedThreshold?` | —                            | Infinite scroll pass-through                                                                                                                                      |
| `isLoading?` / `isError?`                  | `boolean`                    | **Unconditional** — show `BlockLoadingState` / error state regardless of data; `isLoading` = initial load (refresh uses `onRefresh`); `isError` replaces the list |
| `emptyComponent?` / `errorComponent?`      | `ReactNode`                  | `emptyComponent` renders as `ListEmptyComponent` — header stays visible over empty results                                                                        |
| `onRetry?`                                 | `() => void`                 | Error retry button                                                                                                                                                |
| `contentContainerStyle?`                   | `object`                     | Merged over default `{ padding: 16, paddingBottom: 24, flexGrow: 1 }`                                                                                             |

### TemplateSearchableSectionListScreen

Sectioned list shell for search + infinite-pagination surfaces (students browse list, and the
`BlockSearchableSelectSheet` picker content):

| Prop                                                       | Purpose                                                                                                                                            |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `header?` / `footer?`                                      | `ReactNode` outside the list (header above the search, footer below the list — the picker's pinned Save)                                           |
| `searchPlaceholder`                                        | Search field placeholder                                                                                                                           |
| `sections?` / `items?`                                     | Month-year grouped rows or flat items (rendered as a single untitled section)                                                                      |
| `isLoading?` / `isError?` / `onRetry?`                     | **Unconditional** — loading = 8 pulse **skeleton rows**, error = centered `BlockRetry` (template-level states, screen data blocks stay off-screen) |
| `emptyLabel?` / `emptyComponent?`                          | Empty state (default: centered muted text)                                                                                                         |
| `hasMore?` / `isLoadingMore?`                              | End-reached guard + loading-more spinner footer                                                                                                    |
| `onSearchChange`                                           | **700ms debounced** — the host resets its page cursor to 1                                                                                         |
| `onEndReached?` / `onEndReachedThreshold?`                 | Infinite scroll (guarded by `hasMore && !isLoadingMore`)                                                                                           |
| `onRefresh?`                                               | Pull-to-refresh (accent spinner, template-owned state)                                                                                             |
| `keyExtractor` / `renderItem({item,index,isFirst,isLast})` | Rows render through the host; `isFirst`/`isLast` are **per section** for grouped-card rounding                                                     |
| `searchTestID?` / `listTestID?` / `loadingTestID?`         | e2e hooks (defaults `search-input` / `searchable-list` / `searchable-loading`)                                                                     |
| `searchClassName?` / `contentContainerStyle?`              | Padding overrides (the picker sheet passes zero horizontal padding — the sheet frame owns the inset)                                               |

Rules: owns the search field (root-controlled `UiSearchField`) and its debounce; search stays fixed
above the list; grouped-card rounding per section (first/last, transparent `h-px` gaps); both
scrollbar indicators off; `ItemSeparatorComponent`/`ListFooterComponent` are component types, never
JSX elements.

## List Pattern (Grouped Cards)

The iOS-style grouped list: `bg-surface` cards stacked with a 1px gap on the `bg-background` page. The gap shows the page background behind — no separator lines needed.

```
bg-background template
┌──────────────────────────────┐
│ Card 1  bg-surface  rounded-t-2xl │  ← first item only
├─ 1px gap (transparent h-px) ─┤  ← looks like a separator
│ Card 2  bg-surface  flat     │  ← middle items: NO radius
├─ 1px gap ────────────────────┤
│ Card N  bg-surface  rounded-b-2xl │  ← last item only
└──────────────────────────────┘
```

### `BlockGroupedList` (static content)

Wraps any children into a grouped card list: `gap-px`, each item wrapped in `overflow-hidden`, first item `rounded-t-2xl`, last `rounded-b-2xl`, single item `rounded-2xl`. Items must set their own `bg-surface`.

```tsx
<BlockGroupedList className="mb-4">
  <UiView className="bg-surface px-4 py-3 gap-0.5">
    <UiText className="text-xs text-muted">Auth Email</UiText>
    <UiText className="text-base text-foreground">{userEmail}</UiText>
  </UiView>
  <UiView className="bg-surface px-4 py-3 gap-0.5">...</UiView>
</BlockGroupedList>
```

### `BlockGroupedList` (grouped container + `.Row` static + virtualized engine)

The one list block — two render engines, one rounded look:

- **`items` mode (static map)** — `items: GroupedListRow[]` renders the built-in row per item
  (icon/avatar left, pill, title, subtitle, badge, optional `right`, chevron),
  with automatic `isFirst/isLast` rounding, `keyExtractor`, `renderRow` override,
  skeleton rows on `isLoading`, retry card on `isError` (or `errorComponent`),
  `emptyComponent` for empty items. Use for SHORT/static lists (rule of thumb:
  up to ~30 rows).
- **`children` mode** — custom rows wrapped with the group's rounding.
- **`virtualized` mode** — `items` + `virtualized` renders a `UiFlatList` engine:
  same rows (`BlockGroupedList.Row` default / `renderRow` override), same
  states (skeleton/error/empty), 1px separator between rows (the FlatList twin
  of `gap-px`), plus the FlatList-only extras as optional props
  (`onEndReached`, `onEndReachedThreshold`, `onRefresh` pull-to-refresh,
  `ListHeaderComponent`, `ListFooterComponent`, `contentContainerStyle`,
  `keyboardShouldPersistTaps`). Use for LONG lists (> ~30 rows). **The
  virtualized list owns the scroll — never nest it inside a ScrollView**
  (same contract as `TemplateFlatListScreen`). TestID: `block-grouped-list-virtualized`.

`BlockGroupedList.Row` is the built-in row (circle avatar or `icon`, title,
subtitle, count badge, optional `right`, chevron; radius via `isFirst`/`isLast`)
— used as the `renderItem` row in the virtualized templates and pickers.

**Shared pieces (`block-grouped-list-parts.tsx`)** — the single source of truth
for the grouped look, reused by every list surface:
`groupedRowClass(isFirst, isLast)` (the rounding math — `.Row`, the map/children
wrappers, and `BlockSearchableSelectSheet` all use it), `GroupedListSkeleton`
(the loading rows — also used by `TemplateFlatListScreen` and
`TemplateSearchableSectionListScreen`), `GroupedListSeparator` (the 1px row
separator for virtualized lists). Never re-implement the rounding or skeleton
inline — import these.

- Avatar is a **circle** (48px). When no avatar is provided, a **first-letter placeholder** shows instead (`bg-accent/10` circle + bold accent letter) — every person row gets a letter avatar by default.

```tsx
<TemplateFlatListScreen
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={(item, index) => (
    <BlockGroupedList.Row
      title={item.name}
      subtitle={item.email}
      avatar={item.avatar}
      isFirst={index === 0}
      isLast={index === items.length - 1}
      onPress={() => onPressItem?.(item.id)}
    />
  )}
  ItemSeparatorComponent={<UiView className="h-px" />}
  emptyComponent={
    <BlockEmptyState icon="people-outline" title="No items yet" />
  }
  errorComponent={
    <BlockErrorState
      icon="alert-circle-outline"
      title="Something went wrong"
      subtitle="Failed to load items"
      onRetry={onRetry}
    />
  }
/>
```

Rules:

- Separator is a **transparent** `h-px` gap — never `bg-separator` lines in grouped lists
- Radius math always uses `index === 0` and `index === data.length - 1` — via `groupedRowClass`
- **Pick the engine by size**: short/static lists (< ~30 rows) → `BlockGroupedList` map mode
  (inside a scrollable screen body); long lists → `virtualized` (`BlockGroupedList` `virtualized`
  or `TemplateFlatListScreen`) or the sectioned/searchable templates. A `BlockGroupedList`
  `items` list inside `TemplateScrollableScreen` with a growable data source is a perf bug.
- **Pagination reference**: the `teacher-class-students-load-more` screen story is an interactive
  load-more demo — a mock paged API (87 students, 20/page, ~600ms delay) behind the real
  `TeacherClassStudentsScreen`, exercising `hasMore`/`isLoadingMore`/`onEndReached`
  (scroll to the bottom → footer spinner → next page), pull-to-refresh, and debounced search
  resetting the page cursor.
- The grouped-card rounding applies to **every list-like surface**, including SectionList rows
  (`UiSectionList`): first row of each section `rounded-t-2xl`, last `rounded-b-2xl`, single row
  `rounded-2xl`, rows separated by a transparent `h-px` gap — see `BlockSearchableSelectSheet`

## Form Pattern (react-hook-form + zod)

All forms use **react-hook-form with a zod resolver** (`zodResolver`) and `mode: "onChange"`. **The submit is NEVER disabled for incomplete forms** — validation runs on submit (`handleSubmit`), rendering per-field error states AND specific error toasts (the incorrect field's message, capped at 3) so the user notices what is wrong; only `isSubmitting` disables the button (with a right-of-label spinner). **Sheet submits are async (`(values) => Promise<boolean>`)**: the sheet closes only when the callback resolves `true`; on rejection the DS maps field errors under the inputs (`applyApiFieldErrors`) and reports through `onFormError` (same errors toast) — the sheet stays open so the form state survives. **The screen owns the form** — content and sticky footer are sibling subtrees, so `control`/`form` are passed as props (never context):

```tsx
const schema = z.object({ name: z.string().min(1, "Name is required.") });
type FormValues = z.infer<typeof schema>;

const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  mode: "onChange",
});

const sheetId = showFullSheet(
  <BlockForm
    control={form.control}
    fields={[{ name: "name", label: "Name" }]}
  />,
  <BlockFormSubmit
    form={form}
    submitLabel="Save"
    onSubmit={(values) => {
      onSave?.(values);
      closeFullSheet(sheetId);
    }}
  />,
);
```

- **`BlockFormField`** — one schema-driven field (`type: "text" | "date" | "number" | "textarea"`); zod messages render in `FieldError`; `date` opens `useDatePickerSheet`; optional `testID?` (E2E taps fields by testID — never placeholder text)
- **`BlockForm`** — renders a `FormFieldDef<T>[]` list
- **`BlockFormSubmit`** — footer button; `submitTestID?`; **always pressable** — pressing runs the zod resolver, per-field errors render next to each field, and `onSubmit` fires only when the form is valid (the button disables while a submit is in flight)
- **`BlockFormSheetHeader`** — the standard full-sheet form header: `title` (`text-xl font-semibold` + `mb-2`) + optional `subtitle` (`text-sm text-muted` + `mb-4`). Every sheet form uses it (invite/edit teacher, create/edit student, single-field sheets) — never inline `UiText` headers. **Pinned rule:** multi-field forms pass it via `showFullSheet(content, footer, { header })` so it renders in a fixed row ABOVE the scroll — the title/subtitle never scrolls away with the fields (single-field `BlockFormSheet` content is short and keeps it inline)
- **`BlockFormSheet`** — single-field convenience (rename/new-semester/link-parent): `{ form, title, subtitle?, label?, placeholder?, fieldName? }` — renders `BlockFormSheetHeader`
- **`BlockFilterSheet`** — filter form (`FilterFormValues { q, status? }`); chips via `useWatch` + `setValue`
- Feature schemas live next to their screens (e.g. `studentSchema` in `admin-students-screen.tsx`)

> **Rule: overlay forms must subscribe per-component (`useFormState`/`Controller`), never via
> `form.formState` reads.** Overlay content is captured at open time and rendered as a sibling of
> the host screen — RHF's formState updates re-render only the `useForm` host, so anything inside
> the sheet reading `form.formState` (e.g. `BlockFormSubmit`'s old `!form.formState.isValid`)
> never re-renders and the submit stays disabled forever (the original "unreachable submit"
> bug). `BlockFormSubmit` uses `useFormState({ control: form.control })`; `BlockForm`'s fields go
> through `Controller` (per-field subscription). Any new block rendered inside a sheet must
> subscribe the same way.

> **Rule: sheet forms are card-free.** Full-sheet content sits directly on `bg-background` — never
> wrap sheet fields in `UiCard` (or any card surface). The standard sheet-form shape is the
> create-semester pattern: `BlockFormSheet` (title + label + field) with a sticky
> `BlockFormSubmit` footer — link-parent email entry follows it. `BlockEmailForm`'s card belongs
> to scroll-page compositions (login), never inside a sheet.

## Teleport Pattern (Overlays)

Surfaces: **drawer** (left), **bottom sheet** / **full sheet** (bottom, ephemeral), **menu** (anchor-pointed), **toast** (top), **bottom tab bar** (`TeleportTabBarView` — persistent chrome pinned at the bottom; `showTabBar(config)` / `hideTabBar()` on the context; rendered above the Stack but below ephemeral surfaces; app drives `activeKey`/`onPress`; `badge` count pill / `dot` per item; `TAB_BAR_BASE_HEIGHT` for content clearance).

`TeleportProvider` provides bottom sheets, full sheets, toasts, and a drawer via `useTeleport()`:

```tsx
const { showBottomSheet, showFullSheet } = useTeleport();

showBottomSheet(<BlockConfirmSheet title="Delete?" ... />);   // confirmations
showFullSheet(<BlockFormSheet title="Rename" ... />);         // forms with text inputs
```

- The sheet **frame is automatic**: backdrop, slide-up animation, and `UiCloseButton` — sheet _content_ must not include its own close button
- Sheet content renders on `bg-background` (form controls inside sheets stay compliant with the "forms on background" rule)
- Sheets render inside the provider's `flex-1 overflow-hidden` View — scoped to the phone frame in the story gallery
- **Overlay content is captured at open time** — the element passed to `showFullSheet`/`showBottomSheet` is frozen; host re-renders never refresh an open sheet. Rule: **mutable state must live inside the sheet content component** (e.g. `BlockSearchableSelectSheet`'s checked-set lives in a `PickerContent`-style wrapper), and live/query data must come from hooks inside the content (or the sheet must be re-opened). Never pass controlled state that changes while the sheet is open.
- **Stories that open sheets must wrap their render in `<TeleportProvider>`**

```tsx
render: () => (
  <TeleportProvider>
    <SomeSheetDemo />
  </TeleportProvider>
);
```

### Bottom sheets vs full sheets

> **Rule: bottom sheets never contain text inputs — ANY form submission goes in a full sheet.**
> Bottom sheets are for confirmations and actions only. If a sheet collects input of any kind
> (text fields, email, search-with-submit, date-entry forms) it must be a **full sheet**
> (`showFullSheet`, keyboard-aware + sticky submit). This includes single-field forms such as
> link-parent email entry. Visual regression guard: flow stories render input sheets as
> `TeleportFullSheetView`, never as bottom-sheet containers. Opening a bottom sheet dismisses the
> software keyboard (`showBottomSheet` → `Keyboard.dismiss()`) so a leftover IME can never cover
> the sheet's actions (date-picker confirm, destructive confirms).

| Overlay              | Animation                         | Close button       | Content                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------- | --------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `showBottomSheet`    | slide-up from bottom              | frame top-right    | Confirmations, actions — **never text inputs**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `showFullSheet`      | slide in from right (full screen) | top-right          | **Forms with text inputs** — content wrapped in a keyboard-aware scroll; optional **footer** (`showFullSheet(content, footer)`) rendered in **normal flow** below the scroll (flex column; never absolute, never a `KeyboardStickyView`) — the footer stays **bottom-anchored on every platform** (no keyboard ride: Android edge-to-edge IMEs don't resize the window, and an iOS-only ride made the same flow behave differently per platform — issue #73). The keyboard is dismissed before the submit (E2E: Android-only `hideKeyboard`; the iOS simulator runs keyboardless). Android/web stay bottom-anchored (no keyboard-controller on web)                                                                                             |
| `useDatePickerSheet` | bottom sheet (iOS wheel)          | frame top-right    | Date selection — Day/Month/Year wheel columns, snaps to nearest value on settle, confirm closes; `open({ title, value, onConfirm })`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `useTeleportMenu`    | anchor-relative dropdown          | light scrim (0.15) | Action menus — `open(triggerRef, items)` measures the trigger via `measureInOverlay` (window-delta vs provider root) and right-aligns the panel 6px below it; items `{ key, label, subtitle?, icon?, danger?, onPress?, testID? }`; **card rows**: leading accent-circle icon (`bg-accent/10`, danger → `bg-danger/10` red), semibold title + muted `text-xs` subtitle, rounded first/last (`gap-px` grouping), **no chevron**, `accessibilityLabel = label`, panel width **260**; rendered through `react-native-teleport` (`PortalProvider` + `PortalHost name="teleport-menu"` mounted inside `TeleportProvider`) — portal content must set `pointerEvents="auto"` on its root wrappers (the web `PortalHost` forces `pointer-events: none`) |

Notes:

- On **web**, the full sheet falls back to a plain scroll view (browsers resize the viewport; no keyboard avoidance needed — `KeyboardAwareScrollView` is incompatible with Reanimated 4 on web)
- On **native**, host apps must wrap their root in `KeyboardProvider` (like worktrees-studio-school does) for full keyboard-aware behavior
- **Keyboard rule (full sheets)**: the sheet's scroll always runs with
  `keyboardShouldPersistTaps="handled"` + `bottomOffset={20}` (mirrors `TemplateScrollableScreen`) —
  taps reach fields/rows/footer buttons while the keyboard is open (never "dismiss on first tap")
  and the focused input keeps clearance above the keyboard edge. Never remove or override these on
  a sheet scroll. **Drag dismisses the keyboard** (`keyboardDismissMode="on-drag"` on iOS): any
  drag in the sheet body closes the IME — standard iOS sheet behavior and the reason Maestro's
  standard `hideKeyboard` swipe works on every sheet (long or short). **Dismiss on outside tap**:
  `BlockFormSheetHeader` (single-field sheets) and every field label (`BlockFormField`) are wrapped
  in a transparent `accessible={false}` pressable calling `Keyboard.dismiss()` — tapping static
  text closes the keyboard; inputs, the date trigger and the footer stay one-tap. **The scroll content
  keeps its natural height — NO `flexGrow`** (a `flexGrow: 1`
  content container pins the content to the viewport height, leaving zero scrollable overflow, so
  the keyboard-aware scroll can't reveal the focused input on iOS). **Footer layout rule**: the
  full sheet is a flex column — close row, scroll (`flex: 1`), then the footer in **normal flow**
  (`bg-surface px-5 pt-3`, `paddingBottom: insets.bottom + 12`). Never
  position the footer absolutely over the scroll (the scroll swallows the taps — the submit never
  gets pressed, with the keyboard open or closed) and never use `KeyboardStickyView` (removed).
  **No keyboard ride on any platform**: the footer stays bottom-anchored while the IME is open, so
  the submit is tapped only after the keyboard is dismissed (E2E: Android-only `hideKeyboard`; the
  iOS simulator runs keyboardless). An iOS-only ride was removed — Android edge-to-edge IMEs never
  resize the window (`adjustResize` is dead), and the platform split made the same E2E flow behave
  differently.
  **`KeyboardProvider` must wrap the app root (hosts get it via `DsProvider`; the expo-story
  gallery root layout includes it too) — without it the sheet receives no keyboard events and
  forms are neither scrollable nor keyboard-aware.**

> Sheets remain for confirmations, actions, multi-step flows, and filters (`BlockFilterSheet` in a full sheet via the navbar menu).

- **Character usage**: public/shared screens take the role-neutral `teacher-char.png`; role home heroes (teacher + parent) take `holding-hands-char.png`; list-row status pills (`BlockGroupedList` row `pill`/`pillTone`) render above the title in the text column

## Reusable Blocks (`src/components/reusable-blocks/`)

Semantic UI patterns composed from heroui-primitive components. Each exports both a plain React component and a ComponentDef (for story preview sidebar).

| Block               | Props                                                                                                                         | Callbacks                           |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `BlockScreenHeader` | `title`, `subtitle`                                                                                                           | —                                   |
| `BlockEmailForm`    | `email`, `emailError`, `isLoading`, `buttonLabel`                                                                             | `onChangeEmail`, `onPressSendCode`  |
| `BlockSocialAuth`   | `showDivider`, `showGoogle`                                                                                                   | `onPressGoogle`                     |
| `BlockGuidanceTip`  | `imageUrl`, `message`, `imagePosition`                                                                                        | —                                   |
| `BlockNavBar`       | `title`, `showBack?`, `showHamburger?`, `right?`, `menuItems?`, `isBusy?`, `backTestID?`, `menuTestID?`, `menuTriggerTestID?` | `onPressBack?`, `onPressHamburger?` |

`menuItems` renders the **three-dot** header menu (centralized in the navbar — opens an anchored `TeleportMenu` with the given `TeleportMenuItem[]`; single-item menus are fine). `right` remains for non-menu custom content. `showMenu` was removed. `TeleportMenuItem` supports `testID?` (e2e) and renders as a **card row** (optional `icon?` in an accent circle + optional `subtitle?`, danger tint, width 260 — see the Teleport Pattern section); the full sheet's close button carries the fixed `full-sheet-close` testID.

`isBusy` is a **standalone prop** — never derived from `isLoading`/`isError` (hosts pass it explicitly when navigation should be blocked). Screens accept their own `isBusy` prop forwarded to the navbar, exposed as an independent story control. When busy, the hamburger, back button, and the `right`/menu slot all stay **visible but disabled** (dimmed; the `right` slot is touch-blocked via `pointerEvents`).
| `BlockOtpForm` | `otp`, `otpError`, `isLoading`, `buttonLabel` | `onChangeOtp`, `onPressVerify` |
| `BlockStatCard` | `icon`, `value`, `label` | `onPress?` |
| `BlockListItem` | `title`, `subtitle?`, `avatar?`, `badge?`, `hideAvatar?`, `isFirst?`, `isLast?` | `onPress?` |
| `BlockGroupedList` | `children`, `className?` | — |
| `BlockEmptyState` | `icon?`, `title`, `subtitle?` | — |
| `BlockLoadingState` | — | — |
| `BlockErrorState` | `icon?`, `title`, `subtitle?` | `onRetry?` |
| `BlockRetry` | `label?` (default "Try again"), `onRetry?` | centered tap-to-retry affordance used by block error states |
| `BlockHomeHero` | `welcome`, `hint`, `scanLabel`, `characterImage?`, `infoImage?`, `characterSize?`, `onPressScan/Info?`, testIDs | accent hero with character art + variant-driven scan CTA (`UiButton` secondary + `UiButton.Label`) |
| `BlockCenteredState` | `icon`, `title`, `subtitle?`, `actionLabel?`, `onAction?` | shared surface-card state pattern backing `BlockEmptyState` and `BlockRetry` (icon 48 + `text-base` title + optional action link) |
| `BlockProfileHeader` | `name`, `role?`, `avatar?`, `pillClassName?`, `pillTextClassName?` | — |
| `BlockFilterSheet` | `form`, `title?`, `searchPlaceholder?`, `statusLabel?`, `options` | RHF (`FilterFormValues { q, status? }`); search = generic text field, chips via `useWatch`/`setValue`; pairs with the full sheet's sticky **Apply** footer |
| `BlockConfirmSheet` | `title`, `description?`, `confirmLabel`, `cancelLabel?`, `variant?`, `isConfirming?` | `onConfirm`, `onClose` |
| `BlockOptionSheet` | `title`, `options: { label, value }[]`, `selectedValue?` | Radio single-select via `UiRadioGroup.Item` (option testIDs `option-<value>`); applies on select + auto-closes (`onSelect(value)` then `onClose`) — the standard single-select sheet (no select component) |
| `BlockForm` | `control`, `fields: FormFieldDef<T>[]`, `isDisabled?` | renders schema-driven fields |
| `BlockFormSheet` | `form`, `title`, `label?`, `placeholder?`, `fieldName?` (default "name") | single-field convenience on the generic base (rename/new-semester) |
| `BlockFormField` | `control`, `field: FormFieldDef<T>`, `isDisabled?` | one field: `Controller` + `UiTextField`/`UiLabel`/`UiInput`/`UiTextArea` + `FieldError`; `FormFieldDef { name, label, placeholder?, type?: "text"\|"date"\|"number"\|"textarea", autoCapitalize?, autoFocus? }`; `date` opens `useDatePickerSheet` |
| `BlockFormSubmit` | `form`, `submitLabel`, `onSubmit` | sticky footer button; disabled until `form.formState.isValid`, submits via `form.handleSubmit` |
| `BlockMediaPicker` | `variant?` ("image"/"video"/"both"), `mediaType?`, `photoUrl?`, `videoUrl?`, `uploadingUri?`, `uploadProgress?`, `shape?`, copy props, `isUploading?`, `disabled?`, `requireChangeConfirm?`, `requireDeleteConfirm?`, `cancelLabel?`, `testID?` | `onPickImage?`, `onPickVideo?` (presentational — host wires pick + upload; see component JSDoc for per-platform integration). **Empty state is icon-only** (accent circle + camera/videocam) and shares one height (132px) with the filled state. While `isUploading` the change/delete rows become skeletons and the preview shows `uploadingUri` (picked local file) — or a placeholder — with a dark overlay (`uploadProgress` → % + bar, otherwise "Uploading…"). **Crop pipeline (student portraits & avatars)**: inside full sheets the host must NOT wire the picker directly (sheet content is frozen at open — see below) — use `BlockPhotoField` instead; standalone hosts (e.g. `ProfilePhotoSheet`) wire `onPickImage` → pick → `<BlockImageCropSheet>` → upload (`uploadStudentPortrait`/`uploadUserAvatar`) |
| `BlockImageCropSheet` | full-screen RN Modal (`overFullScreen`, `statusBarTranslucent`) | own toolbar (Cancel / title / Done) | Image crop editor — `visible`, `uri`, `sourceWidth`, `sourceHeight`, `shape?` ("square"\|"portrait"\|"circle"), `aspectRatio?`, `ratioOptions?`, `maxDimension?`, label props, `onConfirm(CroppedImageAsset)`, `onCancel`; draggable/resizable crop box + corner/move gestures, dark mask, processing overlay; confirm → `expo-image-manipulator` (crop + resize to `maxDimension` + JPEG 0.85 + base64) → `CroppedImageAsset { uri, width, height, mimeType, fileName, base64 }`; **ratio bar is hidden whenever a ratio is locked** (a passed `aspectRatio` or a square/portrait `shape` — the host decides, the crop is fixed); the bar only shows for free crops (`aspectRatio={null}` or `shape="circle"`); **Modal on purpose** — its own native window paints above open teleport sheets/chrome; `GestureHandlerRootView` sits INSIDE the Modal (a Modal is detached from the app root); the DS never picks/uploads. **Host dismissal (school `dismissCrop` parity)**: keep the Modal mounted — split picked-asset state (mounts it) from a `cropVisible` state; on confirm/cancel set `cropVisible=false` and clear the asset + run the upload only after a **350ms** timeout (the Modal's slide-out) — **never unmount a visible Modal** (Android Fabric tears the window down → app restart / frozen underlying UI) |
| `BlockPhotoField` | sheet photo field — owns `photoUrl`/`isUploading`/crop state INSIDE the sheet | — | **FULL-SHEET PHOTO RULE**: `showFullSheet(content)` captures the content as a frozen React element in the provider's overlay state — host `photoUrl`/`isUploading` changes never reach an open sheet (the photo only appears after re-opening) and frozen `onPickImage`/submit closures hold stale urls. Photo state must therefore live in a component INSIDE the sheet: `BlockPhotoField` does pick (expo-image-picker) → `BlockImageCropSheet` → `onUploadRequest(asset)` (host-injected upload returning the public URL) → live preview + `onPhotoChange(url|null)`; hosts mirror that into a **ref** that the sheet's submit reads at press time. Props: `initialPhotoUrl?`, `shape` ("portrait"\|"square"), `aspectRatio`, `maxDimension?` (512), `disabled?`, `testID?`, `onUploadRequest`, `onPhotoChange`, `onUploadError?` |
| `BlockSearchableSelectSheet` | `title`, `searchPlaceholder`, `submitLabel` (`{count}` placeholder), `checkedIds: Set<string>`, `sections?` (month-year groups) or `items?` (flat), `isLoading?`, `isLoadingMore?`, `hasMore?`, `emptyLabel?`, `searchTestID?` (`search-input`), `listTestID?`, `rowTestIDPrefix?`, `submitTestID?` | `onSearchChange` (**700ms debounce**), `onToggle(id)`, `onLoadMore` (end-reached, guarded by `hasMore`), `onSubmit(ids)` — see "Searchable assignment pickers" below; composed on `TemplateSearchableSectionListScreen` (title in the header slot, pinned Save in the footer slot) |
| `BlockIdCard` | `name`, `photoUrl?`, `rows: {label,value}[]?`, `qrValue`, `backgroundUrl?`, `logoUrl?`, `seed?` | `onRetry?` — ID-1 portrait identity card (photo, name, identity rows, QR) with the loading contract: `isLoading` = card-shaped pulse skeleton, `isError` = `BlockRetry` centered in the card surface, data = the card; QR renders on every platform (react-native-svg); capture/share wiring lives with the host (`src/lib/capture-and-share.ts`) |

All interaction callbacks are optional — blocks work as presentational without them.

### Searchable assignment pickers

`BlockSearchableSelectSheet` is the standard **full-sync assignment picker** (e.g. teachers/students of a semester). Rules:

- **Full-sync semantics**: checked rows mirror the current membership (`checkedIds` initialized from it) — **checking adds, unchecking removes**; the pinned submit ("Save ({count})") sends the **final full membership** via `onSubmit(ids)` (host maps to `onSync*`). Never per-row remove buttons on the parent list.
- **Search**: heroui `UiSearchField`; the block debounces **700ms** internally and calls `onSearchChange(query)` — the **host resets its page cursor to 1** on search (filter by name).
- **Pagination**: `onEndReached` → `onLoadMore()` (block guards with `hasMore && !isLoadingMore`); loading-more spinner in the list footer. Students are grouped into **month-year sections of DB creation (one year per page, newest first)**; teachers render flat (**20 per page**).
- **Rows**: grouped-card rounding per section (first/last), transparent `h-px` gaps, controlled `checkedIds` — selection state lives **inside the sheet content** (teleport capture rule). A row's `testID` is `` `${rowTestIDPrefix}-${id}` `` while unchecked and gains a **`-checked` suffix once checked** (E2E visibility of selection state; `accessibilityState.checked` is exposed too) — flows must assert the suffixed id after toggling.
- Empty state: "No results". The block is i18n-free — all strings via props.

## i18n: DS screens/blocks carry NO strings — hosts pass `texts`

Every data-driven DS screen takes a **required `texts` prop** (typed per screen, e.g.
`AdminStudentsScreenTexts`, `AdminClassDetailScreenTexts`) and every block a
required label prop — **no English defaults anywhere**. Chrome-only compositions
(login/OTP/suspended, home & profile tabs, dashboard) are prop-driven instead:
every visible string arrives as an individual required prop (`title`, `emailLabel`,
`buttonLabel`, …) — same no-strings guarantee, flat shape. This covers
validation messages (zod schemas built from `texts.validation`), field
labels/placeholders, sheet titles/subtitles/submits, menu labels/subtitles,
search placeholders, empty/error states, confirm-sheet copy, navbar a11y
labels (menu/back/more-actions), media-picker + crop copy, and the
date-picker confirm label (threaded via `FormFieldDef.datePickerConfirmLabel`
→ `useDatePickerSheet`). Hosts build the object with `t(getKey(WORDINGS.X))`
(the app keeps builders in `apps/app/src/lib/ds-texts.ts`).
Menu items carry `testID`s (`admin-student-menu-*`, `admin-class-menu-*`,
`admin-semester-menu-*`, `admin-parent-menu-*`) and confirm sheets
`confirmTestID` for E2E flows. **Row-level E2E testIDs must sit on the
pressable itself, never on a wrapper View** (a wrapper becomes an empty
`clickable=false` a11y node that swallows Maestro taps — see
`docs/app/AGENTS_E2E.md`).

### Block Pattern

```tsx
type Props = {
  data: string;
  isLoading: boolean;
  onChangeData?: (value: string) => void;
  onPressAction?: () => void;
};

export function BlockExample({
  data,
  isLoading,
  onChangeData,
  onPressAction,
}: Props) {
  return (
    <UiCard>
      <UiInput
        value={data}
        onChangeText={onChangeData}
        isDisabled={isLoading}
      />
      <UiButton onPress={onPressAction} isDisabled={isLoading}>
        Action
      </UiButton>
    </UiCard>
  );
}
```

### BlockProfileHeader

Identity header (avatar + name + role pill) on a **transparent** container — not a card:

- `role` is optional — the pill is hidden when absent
- `pillClassName` / `pillTextClassName` override the pill's default `bg-accent/10` + `text-accent` (e.g. banned status: `bg-danger/15` + `text-danger`)

```tsx
<UiView className="items-center gap-3 mb-4">
  {/* circle avatar: expo-image, or initials fallback (w-24 h-24 rounded-full bg-accent/10) */}
  <UiText className="text-xl font-semibold text-foreground text-center">
    {name}
  </UiText>
  <UiView className="bg-accent/10 rounded-full px-3 py-0.5 self-center">
    <UiText className="text-xs uppercase text-accent text-center">
      {role}
    </UiText>
  </UiView>
</UiView>
```

## Screens (`src/components/screens/`)

Full-page compositions that assemble templates + reusable blocks into complete screen examples. Used as presentational baselines — worktrees-studio-school builds its functional screens on top of the same blocks.

**Screen chrome conventions (project-wide consistency):**

- **Navbar actions live in the three-dot menu** (`BlockNavBar` `menuItems`/`menuTriggerTestID`) — no inline `right` icons for add/report/export actions (e.g. grades subjects/tasks screens, attendance calendar's "View report").
- **Pressable list rows get a trailing `chevron-forward`**; static cards that open nothing (form sheets, info rows) render no chevron (e.g. attendance marking sheet cards — the pills are the interactive target).

| Screen                                         | Composes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PublicLoginScreen`                            | `TemplateScrollableScreen` + `BlockScreenHeader` + `BlockEmailForm` + `BlockSocialAuth` + `BlockGuidanceTip`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `PublicOtpLoginScreen`                         | `TemplateScrollableScreen` + `BlockNavBar` + `BlockOtpForm`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `PublicAccountSuspendedScreen`                 | `TemplateScrollableScreen` + `BlockNavBar` (back → login) + title/policy text + `versionText` footer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `TeacherHomeTabScreen` / `ParentHomeTabScreen` | `TemplateScrollableScreen` + `BlockHomeHero` header + `BlockListItem` rows (`hideAvatar`, `class-card` testID) — skeleton/retry/empty/refresh states, `contentPaddingBottom?` for chrome clearance                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `AdminDashboardScreen`                         | `TemplateScrollableScreen` + `BlockNavBar` + 2x2 grid of `BlockStatCard`; `isLoading`/`isError` states                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `AdminTeachersScreen`                          | `TemplateSearchableSectionListScreen` (flat) + `BlockNavBar` (three-dot → Add Teacher) + grouped `BlockListItem` rows (suspended → "Suspended" pill above the name)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `AdminTeacherDetailScreen`                     | `TemplateScrollableScreen` + `BlockNavBar` + `BlockProfileHeader` + `BlockGroupedList` sections                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `AdminParentsScreen`                           | `TemplateSearchableSectionListScreen` (flat, teacher-list contract) + `BlockNavBar` (hamburger only) + `UiSearchField` search + grouped `BlockListItem` rows (banned → "Suspended" pill above the name)                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `AdminParentDetailScreen`                      | `TemplateScrollableScreen` + `BlockNavBar` (three-dot → Suspend/Reactivate) + `BlockProfileHeader` (banned → danger "Suspended" pill) + info `BlockGroupedList` + linked students `BlockGroupedList` + `BlockConfirmSheet` ("Yes" confirm, teleport default `bottom-sheet-close`)                                                                                                                                                                                                                                                                                                                                                                                      |
| `AdminStudentsScreen`                          | `TemplateSearchableSectionListScreen` + `BlockNavBar` (three-dot → Add Student) + `BlockForm`/`BlockPhotoField` in a full sheet (sticky submit; photo flows via a ref) + grouped `BlockListItem` rows (avatar, `NIS: {nis}` subtitle) — searchable, month-year sections, year pagination (same contract as the pickers). **Submit contract**: `onSubmitStudent(values, photoUrl) => Promise<boolean>` — the sheet closes only on `true`; on rejection the DS maps `ApiError` field errors onto the form (`applyApiFieldErrors`) and calls `onFormError(e, consumedFields)` so the host toasts only root errors (max 3) — **the sheet stays open on validation errors** |
| `AdminStudentDetailScreen`                     | `TemplateScrollableScreen` + `BlockNavBar` (back + three-dot menu: Edit / Student ID Card / **Link Parent (host callback)** / **Delete (danger → confirm)**) + `BlockProfileHeader` + Information `BlockGroupedList` fields + **Parents `BlockGroupedList` rows (unlink → danger confirm)** + Class semester cards; the Edit sheet uses the same `Promise<boolean>` submit + stays-open-on-error pipeline as the create sheet                                                                                                                                                                                                                                          |
| `AdminStudentIdCardScreen`                     | `TemplateScrollableScreen` + `BlockNavBar` (back) + `BlockIdCard` (loading/error owned by the block) + share action row — capture via `src/lib/capture-and-share.ts`: native view-shot → RN `Share`; **web html-to-image → PNG download** ("Download ID Card", share only where the browser supports it, download fallback)                                                                                                                                                                                                                                                                                                                                            |
| `AdminClassesScreen`                           | `TemplateFlatListScreen` + `BlockNavBar` (add icon) + grouped `BlockListItem` rows (`hideAvatar`, `{count} Semesters` subtitle)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `AdminClassDetailScreen`                       | `TemplateScrollableScreen` + `BlockNavBar` (back + three-dot → Rename/Delete) + "Semester List" header + grouped semester rows + `BlockFormSheet`/`BlockFormSubmit` (rename + new semester) + `BlockConfirmSheet` (delete)                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `TeacherProfileScreen` / `ParentProfileScreen` | `TemplateScrollableScreen` + `BlockNavBar` (title-only — no back/hamburger, three-dot `menuItems`; tab content screens) + `BlockProfileHeader` + "sections with rows" + version card; `contentPaddingBottom?` for tab-bar clearance; same loading (skeleton rows) / error (body `BlockRetry`) states                                                                                                                                                                                                                                                                                                                                                                   |
| `AdminProfileScreen`                           | `TemplateScrollableScreen` + `BlockNavBar` (back, `backTestID`; optional `menuItems` three-dot — hosts put actions like photo editing / **sign out** here) + `BlockProfileHeader` + "sections with rows" (`ProfileSection` = `{ title?, rows: { label, value?, onPress?, testID? }[] }`) + version card; loading → header + 4 skeleton rows, error → body `BlockRetry`                                                                                                                                                                                                                                                                                                 |
| ~~`AdminStudentCreateScreen`~~                 | removed — create-student lives in the students screen's full sheet                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |     |

```tsx
export function AdminTeachersScreen(props: Props) {
  return (
    <TemplateFlatListScreen
      header={<BlockNavBar title={props.title} showHamburger showMenu={false} ... />}
      data={props.teachers}
      keyExtractor={(item) => item.id}
      renderItem={(item, index) => (
        <BlockListItem ... isFirst={index === 0} isLast={index === props.teachers.length - 1} />
      )}
      ItemSeparatorComponent={<UiView className="h-px" />}
      ...
    />
  );
}
```

### Screen Story (expo-story)

Each screen has a corresponding ComponentDef in `expo-story/items/screens/` with full controls for all props. The story wraps the screen component and maps control values to props — no callbacks in the story (presentational only).

- Register the ComponentDef in `expo-story/items/screens/index.ts` — the `blockRegistry` key **is** the URL slug: `"admin-teachers-screen"` → `/expo-story/blocks/admin-teachers-screen`
- Stories that open bottom sheets wrap their render in `<TeleportProvider>`
- **Controls must be exhaustive — cover every UI state of the screen**: list loading/error/empty/refresh, and any chrome the screen appears with (active tab, badges/dots). Derive related states from a single select (e.g. `listState: data|loading|error|empty`) so every toggle is actually reachable — never hardcode data that gates a state behind an unreachable condition (e.g. hardcoded non-empty `classes` makes `isLoading`/`isError` no-ops)
- When a screen is always shown with chrome (e.g. the bottom tab bar), the story item composes the frame (screen + chrome) so chrome states are checkable too; the screen component itself stays chrome-free

### Flow Story (expo-story)

Flows are multi-frame diagrams mirroring a real app feature (one phone frame per screen). Each flow is a `ComponentDef` with `category: "flows"` in `expo-story/items/flows/` — the `blockRegistry` key is the URL slug: `"flow-admin-login-with-otp"` → `/expo-story/blocks/flow-admin-login-with-otp`.

- File naming: `flow-<name>.expo-story.tsx`, e.g. `flow-admin-login-with-google.expo-story.tsx`
- Composition: `<DragNode id="login" initialX={50} initialY={0}>` phone frames (`w-[375px] h-[812px] bg-background border-4 border-separator phone-frame-node overflow-hidden`) rendering the screen stories' `.render({...})` with representative props, connected by `<SvgArrow from="login" to="otp" label="Send OTP" />`
- **Phone frames have a FIXED size** (`w-[375px] h-[812px]` + `overflow-hidden`) — they never grow with their content, exactly like a real phone. Tall content scrolls INSIDE the frame: screens must be built on the scrollable templates (`TemplateScrollableScreen`/`TemplateFlatListScreen`/searchable lists) so the frame's fixed box scrolls instead of stretching. A frame that grows (e.g. `min-h-[812px]`) is a bug — the storyboard canvas relies on uniform 375×812 frames (this also keeps the flow arrows and drag nodes aligned).
- Import the screen ComponentDefs from `../screens/*.expo-story` (never render raw screens)
- **Flow frames pass every prop explicitly — never call `render({})`**: the story host merges control defaults via `useControls`, but flows invoke `.render(...)` directly, so `{}` yields `undefined` props (blank frames / crashes on optional data)
- Flows are presentational (no interactivity, no callbacks) — they mirror the real app's screen sequence and prop wiring
- **`DragNode` extras**: optional `href` (frame becomes a link to its blocks page — "Open" badge top-right, pointer cursor on web) and optional `steps` (Maestro-style action/assertion checklist rendered as a caption panel below the frame — `tapOn:`/`inputText:` lines in accent, `assertVisible:`/`assertNotVisible:` in foreground). Every frame mirrors the same-named Maestro E2E's steps.
- Every app flow plan ships a matching Flow story + a same-named Maestro E2E (see AGENTS_APP.md)
- **Flows compose screen stories only** — every surface a flow shows (sheets, dialogs, menus, drawer, and their inner states) **must be reachable as a screen-story `case`**. Screen stories expose a `case` radio list of named scenarios (state combinations — never a state the flows can't produce); data controls (title/counts/labels) stay as text/select controls, but the state toggles are cases.

## Loading States

**Screens have no loading/error states — loading belongs to the blocks.** A screen always renders its blocks and distributes the data state props; nothing renders above the blocks.

**Block contract** — every data-driven block accepts `isLoading?`, `isError?`, `onRetry?` and renders in its own slot:

| State (first-load only: `isLoading && !data`) | Presentation                                                                                            |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| loading                                       | **Pulse skeleton** mirroring the block's layout (heroui `UiSkeleton variant="pulse"`) — no layout shift |
| error                                         | **Centered reload icon + "Try again" label** (`BlockRetry`, tap → `onRetry`)                            |
| data                                          | the block's content                                                                                     |

**Error and empty states keep the same container as the data** — same surface/card + rounding as the loaded rows, with the retry (`BlockRetry`) or empty content centered inside it (never a bare block floating outside the group, and never inside a row's flex layout where it would sit off-center).

**Empty and retry share one structure** — `BlockCenteredState` (internal): icon (48, muted) + `text-base` title + optional `text-sm` subtitle + optional accent action link, all centered in the surface card. `BlockEmptyState` = icon/title/subtitle; `BlockRetry` = refresh icon + explicit `title` ("Couldn't load this content" default) + `label` action ("Try again"). Data blocks plumb `retryTitle`/`retryLabel` so the app localizes both.

- Blocks with the contract today: `BlockStatCard`, `BlockListItem`, `BlockGroupedList` (with `rowCount`), `BlockProfileHeader`, `BlockIdCard`; the templates `TemplateFlatListScreen` / `TemplateSearchableSectionListScreen` render skeleton rows / `BlockRetry` for list screens.
- `BlockLoadingState` (spinner) is **reserved for gates only** — the startup gate and auth-gate moments where the screen cannot render at all. Never inside a screen body.
- Refetches with existing data show nothing (pull-to-refresh only); action states (button busy labels) are not screen loading indicators.
- Convention pointer: AGENTS_CONVENTIONS.md (String Handling) for toast wordings; AGENTS_APP.md for the app-side guard behavior.

## Updated Primitives

### UiText

Uses React Native `Text` directly with full Tailwind className support. `type`, `weight`, `align`, `color`, and `truncate` props are mapped to equivalent Tailwind classes and merged with explicit `className`:

```tsx
<UiText type="h2" weight="semibold" className="text-foreground mb-1">
  Title
</UiText>
```

Default color: `text-foreground` — syncs with dark mode toggle. Without this default, text would inherit browser default color and not respond to theme changes.

### UiLabel

Defaults to `p-1` padding on all sides for consistent spacing between label and input field.

### UiInput

Defaults to `placeholder=". . ."` when no `placeholder` prop is passed. Blocks and screens don't need to specify a custom placeholder.

### UiSectionList

RN `SectionList` wrapper mirroring `UiFlatList` — **both scrollbar indicators off** by default. Used wherever a sectioned list is needed (e.g. month-year groups in `BlockSearchableSelectSheet`). `ItemSeparatorComponent` and friends must be **component types, never JSX elements** (React invariant otherwise).

### UiSearchField

heroui-native `SearchField` wrapper (compound: `UiSearchField.Group` / `.SearchIcon` / `.Input` / `.ClearButton`). **Controlled at the root** — `value` + `onChange` on `UiSearchField` (Input omits `value`/`onChangeText`; ClearButton auto-clears).

## Asset Management

worktrees-studio-ds mirrors worktrees-studio-school's asset pipeline:

- `src/lib/asset-url.ts` — provides `getAssetUrl()` and `ensureAssetsCached()`
- On web (`Platform.OS === "web"`): falls back to direct API URL (`API_ORIGIN`)
- On native: uses `worktrees-studio-asset-cache` module with MMKV for cache tracking
- First launch: fetches asset manifest from API, downloads files to cache
- Subsequent launches: serves from local disk cache
- Images use `expo-image` with `cachePolicy="memory-disk"`

### Asset URL Resolution

```typescript
import { getAssetUrl } from "@/lib/asset-url";

// Returns local cached path (native) or API URL (web)
const uri = getAssetUrl("characters/teacher-char.png");
// → "file:///cache/assets_cache/characters/teacher-char.png" (cached)
// → "https://worker.example.com/api/assets/..." (fallback)
```

### Cache Initialization

In `src/app/_layout.tsx`, `ensureAssetsCached()` is called on startup — same as worktrees-studio-school. The app waits for both fonts and cache before rendering.

## Testing

- Colocated `__tests__/` directories next to tested file
- Use `@testing-library/react-native` for component tests
- Hook tests use `async act()` pattern for React 19 compatibility
