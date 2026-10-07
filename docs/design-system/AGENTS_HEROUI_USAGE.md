<!-- AGENTS_HEROUI_USAGE_START -->

[HeroUI Native Usage]|root: ./src|Best practices and layout conventions for building screens with HeroUI Native.|Follow the layout hierarchy: background → cards → form controls.

# Layout Hierarchy

HeroUI Native screens follow a clear visual hierarchy:

```
Background (bg-background)           ← page/screen root
├── Card (bg-surface)               ← grouped display content
│   ├── Avatar list
│   ├── Settings items
│   ├── Accordion FAQ
│   ├── Button gallery
│   └── ...
├── Form control                    ← directly on bg-background
│   ├── Input
│   ├── TextArea
│   ├── SearchField
│   ├── ControlField
│   ├── Label
│   ├── Radio / RadioGroup
│   └── ...
├── Interactive controls            ← directly on bg-background
│   ├── Button
│   ├── CloseButton
│   ├── LinkButton
│   └── ...
└── Structural layout               ← bg-background, separated by borders
    ├── Toolbar / Navbar
    ├── Sidebar
    └── Controls panel
```

## className Rule

Use Tailwind v4 `className` with HeroUI tokens — never inline `style`:

| Token                       | className                   | When to use                                                                                                                      |
| --------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `--color-background`        | `bg-background`             | Page/screen root, structural layout (toolbar, sidebar, controls panel), phone screen interior                                    |
| `--color-surface`           | `bg-surface`                | **Only** for grouped display cards (settings list, accordion, avatar list, button gallery, etc.) and block page preview backdrop |
| `--color-foreground`        | `text-foreground`           | Primary text                                                                                                                     |
| `--color-muted`             | `text-muted`                | Secondary/helper text                                                                                                            |
| `--color-accent`            | `bg-accent` / `text-accent` | Active states, reset links                                                                                                       |
| `--color-accent-foreground` | `text-accent-foreground`    | Text on accent background                                                                                                        |
| `--color-separator`         | `border-separator`          | Dividers, borders between sections                                                                                               |
| `--color-field`             | `bg-field`                  | Input field background                                                                                                           |

## Critical: Form Controls Never Blend

Form controls must never sit directly on `bg-surface` **without a card** — a bare input on the page background blends into it. Two acceptable placements:

1. **On `bg-background` directly** (page, sheets, inline rows) — the input's `var(--field-background)` separates it from the page:
   ```tsx
   // ✅ Input on bg-background
   <View className="bg-background">
     {" "}
     ← phone screen / page
     <Input variant="primary" placeholder="Email" />
   </View>
   ```
2. **Inside a `UiCard` (bg-surface) form group** — the DS form pattern (see "Form Groups Use UiCard" below); the card separates the whole form from the page and the field background stays visible inside it:
   ```tsx
   // ✅ Form group in a card
   <UiCard variant="default" className="p-4 gap-4">
     <Input variant="primary" placeholder="Email" />
   </UiCard>
   ```

❌ Wrong — a bare control directly on `bg-surface` without a card: the field bg blends with the surface.

## Structural Layout Uses bg-background

Toolbar, sidebar, and controls panel are not cards — they are structural layout elements separated by borders:

```tsx
// ✅ Correct — structural layout
<View className="bg-background border-b border-separator">  // toolbar
<View className="bg-background border-r border-separator">  // sidebar
<View className="bg-background border-l border-separator">  // controls panel
```

# When to Use Cards

## ✅ Use `var(--surface)` cards for grouped display content

Cards group related information for visual scanning:

```tsx
<UiView className="rounded-xl overflow-hidden bg-surface">
  <UiListGroup variant="default">...</UiListGroup>
</UiView>
```

Good candidates:

- Settings or navigation lists (ListGroup)
- FAQ accordions (Accordion)
- Tabbed content (Tabs)
- Status labels or badges (Chip)
- Spinner loading indicators
- Button galleries
- Switch toggles (Quick Settings)
- Alert message groups
- Avatar team lists
- Separator examples
- Typography showcase
- Skeleton loading placeholders

## ✅ Grouped Card Lists (iOS-style)

The preferred list pattern: `bg-surface` items stacked with a **1px gap** directly on a `bg-background` page. The gap shows the page background behind it — no `bg-separator` lines needed.

```
bg-background page
┌──────────────────────────────┐
│ Item 1  bg-surface  rounded-t-2xl │  ← first item ONLY
├─ 1px gap (transparent h-px) ─┤
│ Item 2  bg-surface  flat     │  ← middle items: NO radius
├─ 1px gap ────────────────────┤
│ Item 3  bg-surface  rounded-b-2xl │  ← last item ONLY
└──────────────────────────────┘
```

Rules:

- Cards are `bg-surface`; the page behind is `bg-background`
- First item gets `rounded-t-2xl`, last item `rounded-b-2xl`, middle items no radius, single item `rounded-2xl` — always wrapped in `overflow-hidden`
- Gap between cards is a **transparent** `h-px` spacer (or `gap-px`) — never a `bg-separator` line
- Implementations: `BlockGroupedList` (static children) and `BlockListItem` with `isFirst`/`isLast` (FlatList rows); radius math uses `index === 0` and `index === data.length - 1`
- Bottom sheets use the same grouping for filter/action content

```tsx
// ✅ Correct — grouped card list
<UiView className="gap-px">
  {" "}
  ← 1px gaps
  <UiView className="bg-surface rounded-t-2xl overflow-hidden px-4 py-3">
    <Text className="text-foreground font-medium">John Doe</Text>
    <Text className="text-muted text-sm">john@school.com</Text>
  </UiView>
  <UiView className="bg-surface px-4 py-3">...</UiView> ← flat middle
  <UiView className="bg-surface rounded-b-2xl overflow-hidden px-4 py-3">
    ...
  </UiView>
</UiView>
```

## ✅ Form Groups Use `UiCard` (bg-surface)

Form fields keep their own background (`var(--field-background)`), and the DS groups related fields inside a `bg-surface` card so the form reads as one section against the page:

```tsx
// ✅ DS pattern — form group in a card (BlockEmailForm, BlockOtpForm, AdminStudentCreateScreen)
<UiCard variant="default" className="p-4 gap-4">
  <UiTextField isInvalid={!!error}>
    <UiLabel>Email</UiLabel>
    <UiInput variant="primary" placeholder="you@example.com" />
    {error && <FieldError>{error}</FieldError>}
  </UiTextField>
  <UiButton variant="primary" className="w-full">
    Save
  </UiButton>
</UiCard>
```

- `UiCard` provides contrast (bg-surface vs page background); the inputs' `var(--field-background)` stays visible inside the card
- Each field is `UiTextField` + `UiLabel` + `UiInput` + optional `FieldError`
- **Standalone** controls (a single input on a sheet, an inline filter row) stay on `bg-background` without a card wrapper

Controls always have their own field background:

- Input, TextArea, TextField
- SearchField
- Label
- ControlField (checkbox/radio/switch groups)
- RadioGroup
- CloseButton, LinkButton

Bottom sheets render on `bg-background` and are for confirmations/actions — **never put text inputs in a bottom sheet**. Forms with inputs go in a `TeleportFullSheet` (full-screen, slides in from the right, close button top-right), where the content is wrapped in a `KeyboardAwareScrollView` (`react-native-keyboard-controller`) so the keyboard never covers the fields.

## ✅ Filter Sheet (Full Sheet)

Filters (`BlockFilterSheet`) live in a `TeleportFullSheet` opened from the navbar three-dot menu — the search field and chips sit on the sheet's `bg-background` (no card), and the sticky footer holds the **Apply** button:

```tsx
showFullSheet(
  <BlockFilterSheet
    title="Filter parents"
    options={[
      { label: "All", value: undefined },
      { label: "Active", value: "active" },
    ]}
    value={q}
    onChangeText={setQ}
    selected={status}
    onSelect={setStatus}
  />,
  <UiButton variant="primary" className="w-full" onPress={apply}>
    Apply
  </UiButton>,
);
```

Chips are display/badge controls (not form fields), so they sit directly on the background alongside the SearchField.

# Theme Tokens

| Token                      | Usage                          | Light value | Dark value       |
| -------------------------- | ------------------------------ | ----------- | ---------------- |
| `var(--background)`        | App screen background          | near-white  | near-black       |
| `var(--surface)`           | Card/section background        | white       | dark gray        |
| `var(--surface-secondary)` | Secondary card background      | 95% white   | slightly lighter |
| `var(--foreground)`        | Primary text color             | near-black  | near-white       |
| `var(--muted)`             | Secondary/muted text           | gray        | gray             |
| `var(--accent)`            | Brand accent (buttons, active) | blue        | blue             |
| `var(--color-field)`       | Input field background         | light gray  | dark field       |
| `var(--separator)`         | Dividers between items         | light gray  | dark gray        |

# Semantic Variants (Principle 1)

Use semantic variant names — never raw color values:

| Variant     | Purpose                 | Context              |
| ----------- | ----------------------- | -------------------- |
| `primary`   | Main action, 1 per view | Brand accent         |
| `secondary` | Alternative action      | Subtle background    |
| `tertiary`  | Dismissive (cancel)     | Minimal emphasis     |
| `danger`    | Destructive action      | Red                  |
| `outline`   | Bordered alternative    | Transparent + border |
| `ghost`     | Minimal text button     | No bg or border      |

# Common Patterns

## Form with Input + Label + Button

```tsx
<View style={{ width: "100%", padding: 16, gap: 16 }}>
  <Text className="text-foreground text-xl font-bold">Contact Form</Text>
  <View style={{ gap: 4 }}>
    <Text className="text-foreground text-sm font-medium">Full Name</Text>
    <Input variant="primary" placeholder="Enter your name" />
  </View>
  <Button variant="primary">Submit</Button>
</View>
```

## Settings List with Switch

```tsx
<View className="gap-px">
  <View className="rounded-t-2xl overflow-hidden bg-surface">
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
      }}
    >
      <Text className="text-foreground text-base">Wi-Fi</Text>
      <Switch />
    </View>
  </View>
  <View className="rounded-b-2xl overflow-hidden bg-surface">
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
      }}
    >
      <Text className="text-foreground text-base">Bluetooth</Text>
      <Switch />
    </View>
  </View>
</View>
```

## Card with Avatar + Text

```tsx
<View
  style={{ borderRadius: 12, padding: 16, backgroundColor: "var(--surface)" }}
>
  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
    <Avatar size="md" color="accent">
      <Avatar.Fallback>JD</Avatar.Fallback>
    </Avatar>
    <View>
      <Text className="text-foreground font-medium">John Doe</Text>
      <Text className="text-muted text-sm">Developer</Text>
    </View>
  </View>
</View>
```

<!-- AGENTS_HEROUI_USAGE_END -->
