<page url="/en/docs/native/components/accordion">
# Accordion

**Category**: native
**URL**: https://www.heroui.com/en/docs/native/components/accordion
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/en/native/components/(navigation)/accordion.mdx

> A collapsible content panel for organizing information in a compact space

---

<NativeVideoPlayerView
  target="auto"
  srcLight="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/accordion-docs-light.mp4"
  srcDark="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/accordion-docs-dark-1.mp4"
/>

## Import

```tsx
import { Accordion } from "heroui-native";
```

## Anatomy

```tsx
<Accordion>
  <Accordion.Item>
    <Accordion.Trigger>
      ...
      <Accordion.Indicator>...</Accordion.Indicator>
    </Accordion.Trigger>
    <Accordion.Content>...</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

- **Accordion**: Main container that manages the accordion state and behavior. Controls expansion/collapse of items, supports single or multiple selection modes, and provides variant styling (default or surface).
- **Accordion.Item**: Container for individual accordion items. Wraps the trigger and content, managing the expanded state for each item.
- **Accordion.Trigger**: Interactive element that toggles item expansion. Built on Header and Trigger primitives.
- **Accordion.Indicator**: Optional visual indicator showing expansion state. Defaults to an animated chevron icon that rotates based on item state.
- **Accordion.Content**: Container for expandable content. Animated with layout transitions for smooth expand/collapse effects.

## Usage

### Basic Usage

The Accordion component uses compound parts to create expandable content sections.

```tsx
<Accordion selectionMode="single">
  <Accordion.Item value="1">
    <Accordion.Trigger>
      ...
      <Accordion.Indicator />
    </Accordion.Trigger>
    <Accordion.Content>...</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

### Single Selection Mode

Allow only one item to be expanded at a time.

```tsx
<Accordion selectionMode="single" defaultValue="2">
  <Accordion.Item value="1">
    <Accordion.Trigger>...</Accordion.Trigger>
    <Accordion.Content>...</Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="2">
    <Accordion.Trigger>...</Accordion.Trigger>
    <Accordion.Content>...</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

### Multiple Selection Mode

Allow multiple items to be expanded simultaneously.

```tsx
<Accordion selectionMode="multiple" defaultValue={["1", "3"]}>
  <Accordion.Item value="1">
    <Accordion.Trigger>...</Accordion.Trigger>
    <Accordion.Content>...</Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="2">
    <Accordion.Trigger>...</Accordion.Trigger>
    <Accordion.Content>...</Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="3">
    <Accordion.Trigger>...</Accordion.Trigger>
    <Accordion.Content>...</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

### Surface Variant

Apply a surface container style to the accordion.

```tsx
<Accordion selectionMode="single" variant="surface">
  <Accordion.Item value="1">
    <Accordion.Trigger>
      ...
      <Accordion.Indicator />
    </Accordion.Trigger>
    <Accordion.Content>...</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

### Custom Indicator

Replace the default chevron indicator with custom content.

```tsx
<Accordion selectionMode="single">
  <Accordion.Item value="1">
    <Accordion.Trigger>
      ...
      <Accordion.Indicator>
        <CustomIndicator />
      </Accordion.Indicator>
    </Accordion.Trigger>
    <Accordion.Content>...</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

### Without Separators

Hide the separators between accordion items.

```tsx
<Accordion selectionMode="single" hideSeparator>
  <Accordion.Item value="1">
    <Accordion.Trigger>...</Accordion.Trigger>
    <Accordion.Content>...</Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="2">
    <Accordion.Trigger>...</Accordion.Trigger>
    <Accordion.Content>...</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

### Custom Styling

Apply custom styles using className, classNames, or styles props.

```tsx
<Accordion
  className="rounded-lg"
  classNames={{
    container: "bg-surface",
    separator: "bg-separator/50",
  }}
  styles={{
    container: { padding: 16 },
    separator: { height: 2 },
  }}
>
  <Accordion.Item value="1">
    <Accordion.Trigger>...</Accordion.Trigger>
    <Accordion.Content>...</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

### With PressableFeedback

Use `Accordion.Trigger` with `asChild` prop and wrap content with `PressableFeedback` to add custom press feedback animations.

```tsx
import { Accordion, PressableFeedback } from "heroui-native";
import { View } from "react-native";

<Accordion>
  <Accordion.Item value="1">
    <Accordion.Trigger asChild>
      <PressableFeedback animation={{ scale: false }}>
        <PressableFeedback.Scale className="flex-row items-center flex-1 gap-3">
          <Text>Item Title</Text>
        </PressableFeedback.Scale>
        <Accordion.Indicator />
        <PressableFeedback.Highlight
          animation={{ opacity: { value: [0, 0.05] } }}
        />
      </PressableFeedback>
    </Accordion.Trigger>
    <Accordion.Content>...</Accordion.Content>
  </Accordion.Item>
</Accordion>;
```

## Example

```tsx
import { Accordion, useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";

export default function AccordionExample() {
  const themeColorMuted = useThemeColor("muted");

  const accordionData = [
    {
      id: "1",
      title: "How do I place an order?",
      icon: <Ionicons name="bag-outline" size={16} color={themeColorMuted} />,
      content:
        "Lorem ipsum dolor sit amet consectetur. Netus nunc mauris risus consequat. Libero placerat dignissim consectetur nisl.",
    },
    {
      id: "2",
      title: "What payment methods do you accept?",
      icon: <Ionicons name="card-outline" size={16} color={themeColorMuted} />,
      content:
        "Lorem ipsum dolor sit amet consectetur. Netus nunc mauris risus consequat. Libero placerat dignissim consectetur nisl.",
    },
    {
      id: "3",
      title: "How much does shipping cost?",
      icon: <Ionicons name="cube-outline" size={16} color={themeColorMuted} />,
      content:
        "Lorem ipsum dolor sit amet consectetur. Netus nunc mauris risus consequat. Libero placerat dignissim consectetur nisl.",
    },
  ];

  return (
    <Accordion selectionMode="single" variant="surface" defaultValue="2">
      {accordionData.map((item) => (
        <Accordion.Item key={item.id} value={item.id}>
          <Accordion.Trigger>
            <View className="flex-row items-center flex-1 gap-3">
              {item.icon}
              <Text className="text-foreground text-base flex-1">
                {item.title}
              </Text>
            </View>
            <Accordion.Indicator />
          </Accordion.Trigger>
          <Accordion.Content>
            <Text className="text-muted text-base/relaxed px-[25px]">
              {item.content}
            </Text>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
```

You can find more examples in the [GitHub repository](<https://github.com/heroui-inc/heroui-native/blob/main/example/src/app/(home)/components/accordion.tsx>).

## API Reference

### Accordion

| prop                    | type                                               | default     | description                                                    |
| ----------------------- | -------------------------------------------------- | ----------- | -------------------------------------------------------------- |
| `children`              | `React.ReactNode`                                  | -           | Children elements to be rendered inside the accordion          |
| `selectionMode`         | `'single' \| 'multiple'`                           | -           | Whether the accordion allows single or multiple expanded items |
| `variant`               | `'default' \| 'surface'`                           | `'default'` | Visual variant of the accordion                                |
| `hideSeparator`         | `boolean`                                          | `false`     | Whether to hide the separator between accordion items          |
| `defaultValue`          | `string \| string[] \| undefined`                  | -           | Default expanded item(s) in uncontrolled mode                  |
| `value`                 | `string \| string[] \| undefined`                  | -           | Controlled expanded item(s)                                    |
| `isDisabled`            | `boolean`                                          | -           | Whether all accordion items are disabled                       |
| `isCollapsible`         | `boolean`                                          | `true`      | Whether expanded items can be collapsed                        |
| `animation`             | `AccordionRootAnimation`                           | -           | Animation configuration for accordion                          |
| `className`             | `string`                                           | -           | Additional CSS classes for the container                       |
| `classNames`            | `ElementSlots<RootSlots>`                          | -           | Additional CSS classes for the slots                           |
| `styles`                | `Partial<Record<RootSlots, ViewStyle>>`            | -           | Styles for different parts of the accordion root               |
| `onValueChange`         | `(value: string \| string[] \| undefined) => void` | -           | Callback when expanded items change                            |
| `...Animated.ViewProps` | `Animated.ViewProps`                               | -           | All Reanimated Animated.View props are supported               |

#### `ElementSlots<RootSlots>`

| prop        | type     | description                                       |
| ----------- | -------- | ------------------------------------------------- |
| `container` | `string` | Custom class name for the accordion container     |
| `separator` | `string` | Custom class name for the separator between items |

#### `styles`

| prop        | type        | description                            |
| ----------- | ----------- | -------------------------------------- |
| `container` | `ViewStyle` | Styles for the accordion container     |
| `separator` | `ViewStyle` | Styles for the separator between items |

#### AccordionRootAnimation

Animation configuration for accordion root component. Can be:

- `false` or `"disabled"`: Disable only root animations
- `"disable-all"`: Disable all animations including children
- `true` or `undefined`: Use default animations
- `object`: Custom animation configuration

| prop           | type                                     | default                                                                                         | description                                       |
| -------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `state`        | `'disabled' \| 'disable-all' \| boolean` | -                                                                                               | Disable animations while customizing properties   |
| `layout.value` | `LayoutTransition`                       | `LinearTransition`<br/>`.springify()`<br/>`.damping(140)`<br/>`.stiffness(1600)`<br/>`.mass(4)` | Custom layout animation for accordion transitions |

### Accordion.Item

| prop                    | type                                                                        | default | description                                                                      |
| ----------------------- | --------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------- |
| `children`              | `React.ReactNode \| ((props: AccordionItemRenderProps) => React.ReactNode)` | -       | Children elements to be rendered inside the accordion item, or a render function |
| `value`                 | `string`                                                                    | -       | Unique value to identify this item                                               |
| `isDisabled`            | `boolean`                                                                   | -       | Whether this specific item is disabled                                           |
| `className`             | `string`                                                                    | -       | Additional CSS classes                                                           |
| `...Animated.ViewProps` | `Animated.ViewProps`                                                        | -       | All Reanimated Animated.View props are supported                                 |

#### AccordionItemRenderProps

| prop         | type      | description                                      |
| ------------ | --------- | ------------------------------------------------ |
| `isExpanded` | `boolean` | Whether the accordion item is currently expanded |
| `value`      | `string`  | Unique value identifier for this accordion item  |

### Accordion.Trigger

| prop                | type              | default | description                                             |
| ------------------- | ----------------- | ------- | ------------------------------------------------------- |
| `children`          | `React.ReactNode` | -       | Children elements to be rendered inside the trigger     |
| `className`         | `string`          | -       | Additional CSS classes                                  |
| `isDisabled`        | `boolean`         | -       | Whether the trigger is disabled                         |
| `...PressableProps` | `PressableProps`  | -       | All standard React Native Pressable props are supported |

### Accordion.Indicator

| prop                    | type                          | default | description                                                            |
| ----------------------- | ----------------------------- | ------- | ---------------------------------------------------------------------- |
| `children`              | `React.ReactNode`             | -       | Custom indicator content, if not provided defaults to animated chevron |
| `className`             | `string`                      | -       | Additional CSS classes                                                 |
| `iconProps`             | `AccordionIndicatorIconProps` | -       | Icon configuration                                                     |
| `animation`             | `AccordionIndicatorAnimation` | -       | Animation configuration for indicator                                  |
| `isAnimatedStyleActive` | `boolean`                     | `true`  | Whether animated styles (react-native-reanimated) are active           |
| `...Animated.ViewProps` | `Animated.ViewProps`          | -       | All Reanimated Animated.View props are supported                       |

#### AccordionIndicatorIconProps

| prop    | type     | default      | description       |
| ------- | -------- | ------------ | ----------------- |
| `size`  | `number` | `16`         | Size of the icon  |
| `color` | `string` | `foreground` | Color of the icon |

#### AccordionIndicatorAnimation

Animation configuration for accordion indicator component. Can be:

- `false` or `"disabled"`: Disable all animations
- `true` or `undefined`: Use default animations
- `object`: Custom animation configuration

| prop                    | type                    | default                                      | description                                      |
| ----------------------- | ----------------------- | -------------------------------------------- | ------------------------------------------------ |
| `state`                 | `'disabled' \| boolean` | -                                            | Disable animations while customizing properties  |
| `rotation.value`        | `[number, number]`      | `[0, -180]`                                  | Rotation values [collapsed, expanded] in degrees |
| `rotation.springConfig` | `WithSpringConfig`      | `{ damping: 140, stiffness: 1000, mass: 4 }` | Spring animation configuration for rotation      |

### Accordion.Content

| prop           | type                        | default | description                                         |
| -------------- | --------------------------- | ------- | --------------------------------------------------- |
| `children`     | `React.ReactNode`           | -       | Children elements to be rendered inside the content |
| `className`    | `string`                    | -       | Additional CSS classes                              |
| `animation`    | `AccordionContentAnimation` | -       | Animation configuration for content                 |
| `...ViewProps` | `ViewProps`                 | -       | All standard React Native View props are supported  |

#### AccordionContentAnimation

Animation configuration for accordion content component. Can be:

- `false` or `"disabled"`: Disable all animations
- `true` or `undefined`: Use default animations
- `object`: Custom animation configuration

| prop             | type                    | default                                                              | description                                     |
| ---------------- | ----------------------- | -------------------------------------------------------------------- | ----------------------------------------------- |
| `state`          | `'disabled' \| boolean` | -                                                                    | Disable animations while customizing properties |
| `entering.value` | `EntryOrExitLayoutType` | `FadeIn`<br/>`.duration(200)`<br/>`.easing(Easing.out(Easing.ease))` | Custom entering animation for content           |
| `exiting.value`  | `EntryOrExitLayoutType` | `FadeOut`<br/>`.duration(200)`<br/>`.easing(Easing.in(Easing.ease))` | Custom exiting animation for content            |

## Hooks

### useAccordion

Hook to access the accordion root context. Must be used within an `Accordion` component.

```tsx
import { useAccordion } from "heroui-native";

const { value, onValueChange, selectionMode, isCollapsible, isDisabled } =
  useAccordion();
```

#### Returns

| property        | type                                                                  | description                                                                  |
| --------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `selectionMode` | `'single' \| 'multiple' \| undefined`                                 | Whether the accordion allows single or multiple expanded items               |
| `value`         | `(string \| undefined) \| string[]`                                   | Currently expanded item(s) - string for single mode, array for multiple mode |
| `onValueChange` | `(value: string \| undefined) => void \| ((value: string[]) => void)` | Callback function to update expanded items                                   |
| `isCollapsible` | `boolean`                                                             | Whether expanded items can be collapsed                                      |
| `isDisabled`    | `boolean \| undefined`                                                | Whether all accordion items are disabled                                     |

### useAccordionItem

Hook to access the accordion item context. Must be used within an `Accordion.Item` component.

```tsx
import { useAccordionItem } from "heroui-native";

const { value, isExpanded, isDisabled, nativeID } = useAccordionItem();
```

#### Returns

| property     | type                   | description                                          |
| ------------ | ---------------------- | ---------------------------------------------------- |
| `value`      | `string`               | Unique value identifier for this accordion item      |
| `isExpanded` | `boolean`              | Whether the accordion item is currently expanded     |
| `isDisabled` | `boolean \| undefined` | Whether this specific item is disabled               |
| `nativeID`   | `string`               | Native ID used for accessibility and ARIA attributes |

## Special Notes

When using the Accordion component alongside other components in the same view, you should import and apply `AccordionLayoutTransition` to those components to ensure smooth and consistent layout animations across the entire screen.

```jsx
import { Accordion, AccordionLayoutTransition } from "heroui-native";
import Animated from "react-native-reanimated";

<Animated.ScrollView layout={AccordionLayoutTransition}>
  <Animated.View layout={AccordionLayoutTransition}>
    {/* Other content */}
  </Animated.View>

  <Accordion>{/* Accordion items */}</Accordion>
</Animated.ScrollView>;
```

This ensures that when the accordion expands or collapses, all components on the screen animate with the same timing and easing, creating a cohesive user experience.
</page>

<page url="/en/docs/native/components/alert">
# Alert

**Category**: native
**URL**: https://www.heroui.com/en/docs/native/components/alert
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/en/native/components/(feedback)/alert.mdx

> Displays important messages and notifications to users with status indicators.

---

<NativeVideoPlayerView
  target="auto"
  srcLight="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/alert-docs-light.mp4"
  srcDark="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/alert-docs-dark.mp4"
/>

## Import

```tsx
import { Alert } from "heroui-native";
```

## Anatomy

```tsx
<Alert>
  <Alert.Indicator />
  <Alert.Content>
    <Alert.Title>...</Alert.Title>
    <Alert.Description>...</Alert.Description>
  </Alert.Content>
</Alert>
```

- **Alert**: Main container with `role="alert"` and status-based styling. Provides status context to sub-components via a primitive context.
- **Alert.Indicator**: Renders a status-appropriate icon by default. Accepts custom children to override the default icon. Supports `iconProps` for customising size and color.
- **Alert.Content**: Wrapper for the title and description. Provides layout structure for text content.
- **Alert.Title**: Heading text with status-based color. Connected to root via `aria-labelledby`.
- **Alert.Description**: Body text rendered with muted color. Connected to root via `aria-describedby`.

## Usage

### Basic Usage

The Alert component uses compound parts to display a notification with an icon, title, and description.

```tsx
<Alert>
  <Alert.Indicator />
  <Alert.Content>
    <Alert.Title>New features available</Alert.Title>
    <Alert.Description>
      Check out our latest updates including dark mode support and improved
      accessibility features.
    </Alert.Description>
  </Alert.Content>
</Alert>
```

### Status Variants

Set the `status` prop to control the icon and title color. Available statuses are `default`, `accent`, `success`, `warning`, and `danger`.

```tsx
<Alert status="success">
  <Alert.Indicator />
  <Alert.Content>
    <Alert.Title>Success</Alert.Title>
    <Alert.Description>...</Alert.Description>
  </Alert.Content>
</Alert>

<Alert status="warning">
  <Alert.Indicator />
  <Alert.Content>
    <Alert.Title>Scheduled maintenance</Alert.Title>
    <Alert.Description>...</Alert.Description>
  </Alert.Content>
</Alert>

<Alert status="danger">
  <Alert.Indicator />
  <Alert.Content>
    <Alert.Title>Unable to connect</Alert.Title>
    <Alert.Description>...</Alert.Description>
  </Alert.Content>
</Alert>

```

### Title Only

Omit `Alert.Description` for a compact single-line alert.

```tsx
<Alert status="success" className="items-center">
  <Alert.Indicator className="pt-0" />
  <Alert.Content>
    <Alert.Title>Profile updated successfully</Alert.Title>
  </Alert.Content>
</Alert>
```

### With Action Buttons

Place additional elements like buttons alongside the content.

```tsx
<Alert status="accent">
  <Alert.Indicator />
  <Alert.Content>
    <Alert.Title>Update available</Alert.Title>
    <Alert.Description>
      A new version of the application is available.
    </Alert.Description>
  </Alert.Content>
  <Button size="sm" variant="primary">
    Refresh
  </Button>
</Alert>
```

### Custom Indicator

Replace the default status icon by passing custom children to `Alert.Indicator`.

```tsx
<Alert status="accent">
  <Alert.Indicator>
    <Spinner>
      <Spinner.Indicator iconProps={{ width: 20, height: 20 }} />
    </Spinner>
  </Alert.Indicator>
  <Alert.Content>
    <Alert.Title>Processing your request</Alert.Title>
    <Alert.Description>Please wait while we sync your data.</Alert.Description>
  </Alert.Content>
</Alert>
```

### Custom Styling

Apply custom styles using the `className` prop on the root and compound parts.

```tsx
<Alert className="bg-accent/10 rounded-xl">
  <Alert.Indicator className="pt-1" />
  <Alert.Content className="gap-1">
    <Alert.Title className="text-lg">...</Alert.Title>
    <Alert.Description className="text-base">...</Alert.Description>
  </Alert.Content>
</Alert>
```

## Example

```tsx
import { Alert, Button, CloseButton } from "heroui-native";
import { View } from "react-native";

export default function AlertExample() {
  return (
    <View className="w-full gap-4">
      <Alert status="accent">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Update available</Alert.Title>
          <Alert.Description>
            A new version of the application is available. Please refresh to get
            the latest features and bug fixes.
          </Alert.Description>
        </Alert.Content>
        <Button size="sm" variant="primary">
          Refresh
        </Button>
      </Alert>

      <Alert status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Unable to connect to server</Alert.Title>
          <Alert.Description>
            Unable to connect to the server. Check your internet connection and
            try again.
          </Alert.Description>
        </Alert.Content>
        <Button size="sm" variant="danger">
          Retry
        </Button>
      </Alert>

      <Alert status="success" className="items-center">
        <Alert.Indicator className="pt-0" />
        <Alert.Content>
          <Alert.Title>Profile updated successfully</Alert.Title>
        </Alert.Content>
        <CloseButton />
      </Alert>
    </View>
  );
}
```

You can find more examples in the [GitHub repository](<https://github.com/heroui-inc/heroui-native/blob/main/example/src/app/(home)/components/alert.tsx>).

## API Reference

### Alert

| prop           | type                                                          | default     | description                                                       |
| -------------- | ------------------------------------------------------------- | ----------- | ----------------------------------------------------------------- |
| `children`     | `React.ReactNode`                                             | -           | Children elements to render inside the alert                      |
| `status`       | `'default' \| 'accent' \| 'success' \| 'warning' \| 'danger'` | `'default'` | Status controlling the icon and color treatment                   |
| `id`           | `string \| number`                                            | -           | Unique identifier for the alert. Auto-generated when not provided |
| `className`    | `string`                                                      | -           | Additional CSS classes                                            |
| `style`        | `ViewStyle`                                                   | -           | Additional styles applied to the root container                   |
| `...ViewProps` | `ViewProps`                                                   | -           | All standard React Native View props are supported                |

### Alert.Indicator

| prop           | type              | default | description                                                        |
| -------------- | ----------------- | ------- | ------------------------------------------------------------------ |
| `children`     | `React.ReactNode` | -       | Custom children to render instead of the default status icon       |
| `className`    | `string`          | -       | Additional CSS classes                                             |
| `iconProps`    | `AlertIconProps`  | -       | Props passed to the default status icon (size and color overrides) |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported                 |

#### AlertIconProps

| prop    | type     | default      | description            |
| ------- | -------- | ------------ | ---------------------- |
| `size`  | `number` | `18`         | Icon size in pixels    |
| `color` | `string` | status color | Icon color as a string |

### Alert.Content

| prop           | type              | default | description                                                     |
| -------------- | ----------------- | ------- | --------------------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Children elements (typically Alert.Title and Alert.Description) |
| `className`    | `string`          | -       | Additional CSS classes                                          |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported              |

### Alert.Title

| prop           | type              | default | description                                        |
| -------------- | ----------------- | ------- | -------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Title text content                                 |
| `className`    | `string`          | -       | Additional CSS classes                             |
| `...TextProps` | `TextProps`       | -       | All standard React Native Text props are supported |

### Alert.Description

| prop           | type              | default | description                                        |
| -------------- | ----------------- | ------- | -------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Description text content                           |
| `className`    | `string`          | -       | Additional CSS classes                             |
| `...TextProps` | `TextProps`       | -       | All standard React Native Text props are supported |

## Hooks

### useAlert

Hook to access the alert root context. Must be used within an `Alert` component.

```tsx
import { useAlert } from "heroui-native";

const { status, nativeID } = useAlert();
```

#### Returns

| property   | type                                                          | description                                                  |
| ---------- | ------------------------------------------------------------- | ------------------------------------------------------------ |
| `status`   | `'default' \| 'accent' \| 'success' \| 'warning' \| 'danger'` | Current alert status for sub-component styling               |
| `nativeID` | `string`                                                      | Unique identifier used for accessibility and ARIA attributes |

</page>

<page url="/en/docs/native/components/button">
# Button

**Category**: native
**URL**: https://www.heroui.com/en/docs/native/components/button
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/en/native/components/(buttons)/button.mdx

> Interactive component that triggers an action when pressed.

---

<NativeVideoPlayerView
  target="auto"
  srcLight="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/button-docs-light.mp4"
  srcDark="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/button-docs-dark.mp4"
/>

## Import

```tsx
import { Button } from "heroui-native";
```

## Anatomy

```tsx
<Button>
  <Button.Label>...</Button.Label>
</Button>
```

- **Button**: Main container that handles press interactions, animations, and variants. Renders string children as label or accepts compound components for custom layouts.
- **Button.Label**: Text content of the button. Inherits size and variant styling from parent Button context.

## Usage

### Basic Usage

The Button component accepts string children that automatically render as label.

```tsx
<Button>Basic Button</Button>
```

### With Compound Parts

Use Button.Label for explicit control over the label component.

```tsx
<Button>
  <Button.Label>Click me</Button.Label>
</Button>
```

### With Icons

Combine icons with labels for enhanced visual communication.

```tsx
<Button>
  <Icon name="add" size={20} />
  <Button.Label>Add Item</Button.Label>
</Button>

<Button>
  <Button.Label>Download</Button.Label>
  <Icon name="download" size={18} />
</Button>

```

### Icon Only

Create square icon-only buttons using the isIconOnly prop.

```tsx
<Button isIconOnly>
  <Icon name="heart" size={18} />
</Button>
```

### Sizes

Control button dimensions with three size options.

```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

```

### Variants

Choose from seven visual variants for different emphasis levels.

```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="tertiary">Tertiary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
<Button variant="danger-soft">Danger Soft</Button>

```

### Feedback Variants

The `feedbackVariant` prop controls which press feedback effects are rendered:

- `'scale-highlight'` (default): Built-in scale + highlight overlay
- `'scale-ripple'`: Built-in scale + ripple overlay
- `'scale'`: Built-in scale only (no overlay)
- `'none'`: No feedback animations at all

```tsx
{
  /* Scale + Highlight (default) */
}
<Button feedbackVariant="scale-highlight">Highlight Effect</Button>;

{
  /* Scale + Ripple */
}
<Button feedbackVariant="scale-ripple">Ripple Effect</Button>;

{
  /* Scale only */
}
<Button feedbackVariant="scale">Scale Only</Button>;

{
  /* No feedback */
}
<Button feedbackVariant="none">No Feedback</Button>;
```

### Custom Animation

The `animation` prop controls individual sub-animations. Its shape depends on the `feedbackVariant`.

```tsx
{
  /* Customize scale and highlight (default feedbackVariant) */
}
<Button
  animation={{
    scale: { value: 0.97 },
    highlight: {
      backgroundColor: { value: "#3b82f6" },
      opacity: { value: [0, 0.2] },
    },
  }}
>
  Custom Highlight
</Button>;

{
  /* Customize scale and ripple */
}
<Button
  feedbackVariant="scale-ripple"
  animation={{
    scale: { value: 0.97 },
    ripple: {
      backgroundColor: { value: "#3b82f6" },
      opacity: { value: [0, 0.3, 0] },
    },
  }}
>
  Custom Ripple
</Button>;
```

### Disable Individual Animations

Disable specific sub-animations by setting them to `false`:

```tsx
{
  /* Disable scale, keep highlight */
}
<Button animation={{ scale: false }}>No Scale</Button>;

{
  /* Disable highlight, keep scale */
}
<Button animation={{ highlight: false }}>No Highlight</Button>;

{
  /* Disable both */
}
<Button animation={{ scale: false, highlight: false }}>No Animations</Button>;
```

### Disable All Animations

Use `animation={false}` to disable all feedback, or `animation="disable-all"` for cascading disable:

```tsx
<Button animation={false}>Disabled</Button>
<Button animation="disable-all">Disable All (cascading)</Button>

```

### Loading State with Spinner

Transform button to loading state with spinner animation.

```tsx
const themeColorAccentForeground = useThemeColor("accent-foreground");

<Button
  layout={LinearTransition.springify()}
  variant="primary"
  onPress={() => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
    }, 3000);
  }}
  isIconOnly={isDownloading}
  className="self-center"
>
  {isDownloading ? (
    <Spinner entering={FadeIn.delay(50)} color={themeColorAccentForeground} />
  ) : (
    "Download now"
  )}
</Button>;
```

### Custom Background with LinearGradient

Add gradient backgrounds using absolute positioned elements. Use `feedbackVariant="none"` to disable the default highlight overlay, or use `feedbackVariant="scale-ripple"` for a custom ripple effect.

```tsx
import { Button, PressableFeedback } from "heroui-native";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";

{
  /* Gradient with no feedback overlay */
}
<Button feedbackVariant="none">
  <LinearGradient
    colors={["#9333ea", "#ec4899"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={StyleSheet.absoluteFill}
  />
  <Button.Label className="text-white font-bold">Gradient</Button.Label>
</Button>;

{
  /* Gradient with custom ripple effect */
}
<Button
  feedbackVariant="scale-ripple"
  animation={{
    ripple: {
      backgroundColor: { value: "white" },
      opacity: { value: [0, 0.5, 0] },
    },
  }}
>
  <LinearGradient
    colors={["#0d9488", "#ec4899"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={StyleSheet.absoluteFill}
  />
  <Button.Label className="text-white font-bold" pointerEvents="none">
    Gradient with Ripple
  </Button.Label>
</Button>;
```

## Example

```tsx
import { Button, useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

export default function ButtonExample() {
  const [
    themeColorAccentForeground,
    themeColorAccentSoftForeground,
    themeColorDangerForeground,
    themeColorDefaultForeground,
  ] = useThemeColor([
    "accent-foreground",
    "accent-soft-foreground",
    "danger-foreground",
    "default-foreground",
  ]);

  return (
    <View className="gap-4 p-4">
      <Button variant="primary">
        <Ionicons name="add" size={20} color={themeColorAccentForeground} />
        <Button.Label>Add Item</Button.Label>
      </Button>

      <View className="flex-row gap-4">
        <Button size="sm" isIconOnly>
          <Ionicons name="heart" size={16} color={themeColorAccentForeground} />
        </Button>
        <Button size="sm" variant="secondary" isIconOnly>
          <Ionicons
            name="bookmark"
            size={16}
            color={themeColorAccentSoftForeground}
          />
        </Button>
        <Button size="sm" variant="danger" isIconOnly>
          <Ionicons name="trash" size={16} color={themeColorDangerForeground} />
        </Button>
      </View>

      <Button variant="tertiary">
        <Button.Label>Learn More</Button.Label>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={themeColorDefaultForeground}
        />
      </Button>
    </View>
  );
}
```

You can find more examples in the [GitHub repository](<https://github.com/heroui-inc/heroui-native/blob/main/example/src/app/(home)/components/button.tsx>).

## API Reference

### Button

Button extends all props from [PressableFeedback](./pressable-feedback) (except `animation`, which is redefined) with additional button-specific props.

| prop              | type                                                                                          | default             | description                                                    |
| ----------------- | --------------------------------------------------------------------------------------------- | ------------------- | -------------------------------------------------------------- |
| `variant`         | `'primary' \| 'secondary' \| 'tertiary' \| 'outline' \| 'ghost' \| 'danger' \| 'danger-soft'` | `'primary'`         | Visual variant of the button                                   |
| `size`            | `'sm' \| 'md' \| 'lg'`                                                                        | `'md'`              | Size of the button                                             |
| `isIconOnly`      | `boolean`                                                                                     | `false`             | Whether the button displays an icon only (square aspect ratio) |
| `feedbackVariant` | `'scale-highlight' \| 'scale-ripple' \| 'scale' \| 'none'`                                    | `'scale-highlight'` | Determines which feedback effects are rendered                 |
| `animation`       | `ButtonAnimation`                                                                             | -                   | Animation configuration (shape depends on `feedbackVariant`)   |

For inherited props including `isDisabled`, `className`, `children`, and all Pressable props, see [PressableFeedback API Reference](./pressable-feedback#api-reference).

#### ButtonAnimation

The `animation` prop is a discriminated union based on `feedbackVariant`. It follows the `AnimationRoot` control flow:

- `true` or `undefined`: Use default animations
- `false` or `"disabled"`: Disable all feedback animations
- `"disable-all"`: Cascade-disable all animations including child compound parts
- `object`: Custom configuration with sub-animation keys (see below)

**When `feedbackVariant="scale-highlight"` (default):**

| prop        | type                                     | default | description                                                   |
| ----------- | ---------------------------------------- | ------- | ------------------------------------------------------------- |
| `scale`     | `PressableFeedbackScaleAnimation`        | -       | Scale animation config (`false` to disable)                   |
| `highlight` | `PressableFeedbackHighlightAnimation`    | -       | Highlight overlay config (`false` to disable)                 |
| `state`     | `'disabled' \| 'disable-all' \| boolean` | -       | Control animation state while keeping config (runtime toggle) |

**When `feedbackVariant="scale-ripple"`:**

| prop     | type                                     | default | description                                                   |
| -------- | ---------------------------------------- | ------- | ------------------------------------------------------------- |
| `scale`  | `PressableFeedbackScaleAnimation`        | -       | Scale animation config (`false` to disable)                   |
| `ripple` | `PressableFeedbackRippleAnimation`       | -       | Ripple overlay config (`false` to disable)                    |
| `state`  | `'disabled' \| 'disable-all' \| boolean` | -       | Control animation state while keeping config (runtime toggle) |

**When `feedbackVariant="scale"`:**

| prop    | type                                     | default | description                                                   |
| ------- | ---------------------------------------- | ------- | ------------------------------------------------------------- |
| `scale` | `PressableFeedbackScaleAnimation`        | -       | Scale animation config (`false` to disable)                   |
| `state` | `'disabled' \| 'disable-all' \| boolean` | -       | Control animation state while keeping config (runtime toggle) |

**When `feedbackVariant="none"`:**

Only `'disable-all'` is accepted as a string value. All feedback effects are disabled.

For detailed animation sub-types (`PressableFeedbackScaleAnimation`, `PressableFeedbackHighlightAnimation`, `PressableFeedbackRippleAnimation`), see [PressableFeedback API Reference](./pressable-feedback#api-reference).

### Button.Label

| prop           | type              | default | description                           |
| -------------- | ----------------- | ------- | ------------------------------------- |
| `children`     | `React.ReactNode` | -       | Content to be rendered as label       |
| `className`    | `string`          | -       | Additional CSS classes                |
| `...TextProps` | `TextProps`       | -       | All standard Text props are supported |

## Hooks

### useButton

Hook to access the Button context values. Returns the button's size, variant, and disabled state.

```tsx
import { useButton } from "heroui-native";

const { size, variant, isDisabled } = useButton();
```

#### Return Value

| property     | type                                                                                          | description                    |
| ------------ | --------------------------------------------------------------------------------------------- | ------------------------------ |
| `size`       | `'sm' \| 'md' \| 'lg'`                                                                        | Size of the button             |
| `variant`    | `'primary' \| 'secondary' \| 'tertiary' \| 'outline' \| 'ghost' \| 'danger' \| 'danger-soft'` | Visual variant of the button   |
| `isDisabled` | `boolean`                                                                                     | Whether the button is disabled |

**Note:** This hook must be used within a `Button` component. It will throw an error if called outside of the button context.
</page>

<page url="/en/docs/native/components/card">
# Card

**Category**: native
**URL**: https://www.heroui.com/en/docs/native/components/card
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/en/native/components/(layout)/card.mdx

> Displays a card container with flexible layout sections for structured content.

---

<NativeVideoPlayerView
  target="auto"
  srcLight="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/card-docs-light.mp4"
  srcDark="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/card-docs-dark.mp4"
/>

## Import

```tsx
import { Card } from "heroui-native";
```

## Anatomy

```tsx
<Card>
  <Card.Header>...</Card.Header>
  <Card.Body>
    <Card.Title>...</Card.Title>
    <Card.Description>...</Card.Description>
  </Card.Body>
  <Card.Footer>...</Card.Footer>
</Card>
```

- **Card**: Main container that extends Surface component. Provides base card structure with configurable surface variants and handles overall layout.
- **Card.Header**: Header section for top-aligned content like icons or badges.
- **Card.Body**: Main content area with flex-1 that expands to fill all available space between Card.Header and Card.Footer.
- **Card.Title**: Title text with foreground color and medium font weight.
- **Card.Description**: Description text with muted color and smaller font size.
- **Card.Footer**: Footer section for bottom-aligned actions like buttons.

## Usage

### Basic Usage

The Card component creates a container with built-in sections for organized content.

```tsx
<Card>
  <Card.Body>...</Card.Body>
</Card>
```

### With Title and Description

Combine title and description components for structured text content.

```tsx
<Card>
  <Card.Body>
    <Card.Title>...</Card.Title>
    <Card.Description>...</Card.Description>
  </Card.Body>
</Card>
```

### With Header and Footer

Add header and footer sections for icons, badges, or actions.

```tsx
<Card>
  <Card.Header>...</Card.Header>
  <Card.Body>...</Card.Body>
  <Card.Footer>...</Card.Footer>
</Card>
```

### Variants

Control the card's background appearance using different variants.

```tsx
<Card variant="default">...</Card>
<Card variant="secondary">...</Card>
<Card variant="tertiary">...</Card>
<Card variant="transparent">...</Card>

```

### Horizontal Layout

Create horizontal cards by using flex-row styling.

```tsx
<Card className="flex-row gap-4">
  <Image source={...} className="size-24 rounded-lg" />
</Card>

```

### Background Image

Use an image as an absolute positioned background.

```tsx
<Card>
  <Image source={...} className="absolute inset-0" />
  <View className="gap-4">...</View>
</Card>

```

## Example

```tsx
import { Button, Card } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

export default function CardExample() {
  return (
    <Card>
      <View className="gap-4">
        <Card.Body className="mb-4">
          <View className="gap-1 mb-2">
            <Card.Title className="text-pink-500">$450</Card.Title>
            <Card.Title>Living room Sofa • Collection 2025</Card.Title>
          </View>
          <Card.Description>
            This sofa is perfect for modern tropical spaces, baroque inspired
            spaces.
          </Card.Description>
        </Card.Body>
        <Card.Footer className="gap-3">
          <Button variant="primary">Buy now</Button>
          <Button variant="ghost">
            <Button.Label>Add to cart</Button.Label>
            <Ionicons name="bag-outline" size={16} />
          </Button>
        </Card.Footer>
      </View>
    </Card>
  );
}
```

You can find more examples in the [GitHub repository](<https://github.com/heroui-inc/heroui-native/blob/main/example/src/app/(home)/components/card.tsx>).

## API Reference

### Card

| prop           | type                                                      | default     | description                                                                               |
| -------------- | --------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| `children`     | `React.ReactNode`                                         | -           | Content to be rendered inside the card                                                    |
| `variant`      | `'default' \| 'secondary' \| 'tertiary' \| 'transparent'` | `'default'` | Visual variant of the card surface                                                        |
| `className`    | `string`                                                  | -           | Additional CSS classes to apply                                                           |
| `animation`    | `"disable-all" \| undefined`                              | `undefined` | Animation configuration. Use `"disable-all"` to disable all animations including children |
| `...ViewProps` | `ViewProps`                                               | -           | All standard React Native View props are supported                                        |

### Card.Header

| prop           | type              | default | description                                        |
| -------------- | ----------------- | ------- | -------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Children elements to be rendered inside the header |
| `className`    | `string`          | -       | Additional CSS classes                             |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported |

### Card.Body

| prop           | type              | default | description                                        |
| -------------- | ----------------- | ------- | -------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Children elements to be rendered inside the body   |
| `className`    | `string`          | -       | Additional CSS classes                             |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported |

### Card.Footer

| prop           | type              | default | description                                        |
| -------------- | ----------------- | ------- | -------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Children elements to be rendered inside the footer |
| `className`    | `string`          | -       | Additional CSS classes                             |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported |

### Card.Title

| prop           | type              | default | description                                        |
| -------------- | ----------------- | ------- | -------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Children elements to be rendered as the title text |
| `className`    | `string`          | -       | Additional CSS classes                             |
| `...TextProps` | `TextProps`       | -       | All standard React Native Text props are supported |

### Card.Description

| prop           | type              | default | description                                              |
| -------------- | ----------------- | ------- | -------------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Children elements to be rendered as the description text |
| `className`    | `string`          | -       | Additional CSS classes                                   |
| `...TextProps` | `TextProps`       | -       | All standard React Native Text props are supported       |

</page>

<page url="/en/docs/native/components/checkbox">
# Checkbox

**Category**: native
**URL**: https://www.heroui.com/en/docs/native/components/checkbox
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/en/native/components/(forms)/checkbox.mdx

> A selectable control that allows users to toggle between checked and unchecked states.

---

<NativeVideoPlayerView
  target="auto"
  srcLight="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/checkbox-docs-light.mp4"
  srcDark="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/checkbox-docs-dark.mp4"
/>

## Import

```tsx
import { Checkbox } from "heroui-native";
```

## Anatomy

```tsx
<Checkbox>
  <Checkbox.Indicator>...</Checkbox.Indicator>
</Checkbox>
```

- **Checkbox**: Main container that handles selection state and user interaction. Renders default indicator with animated checkmark if no children provided. Automatically detects surface context for proper styling. Features press scale animation that can be customized or disabled. Supports render function children to access state (`isSelected`, `isInvalid`, `isDisabled`).
- **Checkbox.Indicator**: Optional checkmark container with default slide, scale, opacity, and border radius animations when selected. Renders animated check icon with SVG path drawing animation if no children provided. All animations can be individually customized or disabled. Supports render function children to access state.

## Usage

### Basic Usage

The Checkbox component renders with a default animated indicator if no children are provided. It automatically detects whether it's on a surface background for proper styling.

```tsx
<Checkbox isSelected={isSelected} onSelectedChange={setIsSelected} />
```

### With Custom Indicator

Use a render function in the Indicator to show/hide custom icons based on state.

```tsx
<Checkbox isSelected={isSelected} onSelectedChange={setIsSelected}>
  <Checkbox.Indicator>
    {({ isSelected }) => (isSelected ? <CheckIcon /> : null)}
  </Checkbox.Indicator>
</Checkbox>
```

### Invalid State

Show validation errors with the `isInvalid` prop, which applies danger color styling.

```tsx
<Checkbox
  isSelected={isSelected}
  onSelectedChange={setIsSelected}
  isInvalid={hasError}
/>
```

### Custom Animations

Customize or disable animations for both the root checkbox and indicator.

```tsx
{
  /* Disable all animations (root and indicator) */
}
<Checkbox
  animation="disable-all"
  isSelected={isSelected}
  onSelectedChange={setIsSelected}
>
  <Checkbox.Indicator />
</Checkbox>;

{
  /* Disable only root animation */
}
<Checkbox
  animation="disabled"
  isSelected={isSelected}
  onSelectedChange={setIsSelected}
>
  <Checkbox.Indicator />
</Checkbox>;

{
  /* Disable only indicator animation */
}
<Checkbox isSelected={isSelected} onSelectedChange={setIsSelected}>
  <Checkbox.Indicator animation="disabled" />
</Checkbox>;

{
  /* Custom animation configuration */
}
<Checkbox
  animation={{ scale: { value: [1, 0.9], timingConfig: { duration: 200 } } }}
  isSelected={isSelected}
  onSelectedChange={setIsSelected}
>
  <Checkbox.Indicator
    animation={{
      scale: { value: [0.5, 1] },
      opacity: { value: [0, 1] },
      translateX: { value: [-8, 0] },
      borderRadius: { value: [12, 0] },
    }}
  />
</Checkbox>;
```

## Example

```tsx
import {
  Checkbox,
  Description,
  ControlField,
  Label,
  Separator,
  Surface,
} from "heroui-native";
import React from "react";
import { View, Text } from "react-native";

interface CheckboxFieldProps {
  isSelected: boolean;
  onSelectedChange: (value: boolean) => void;
  title: string;
  description: string;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  isSelected,
  onSelectedChange,
  title,
  description,
}) => {
  return (
    <ControlField isSelected={isSelected} onSelectedChange={onSelectedChange}>
      <ControlField.Indicator>
        <Checkbox className="mt-0.5" />
      </ControlField.Indicator>
      <View className="flex-1">
        <Label className="text-lg">{title}</Label>
        <Description className="text-base">{description}</Description>
      </View>
    </ControlField>
  );
};

export default function BasicUsage() {
  const [fields, setFields] = React.useState({
    newsletter: true,
    marketing: false,
    terms: false,
  });

  const fieldConfigs: Record<
    keyof typeof fields,
    { title: string; description: string }
  > = {
    newsletter: {
      title: "Subscribe to newsletter",
      description: "Get weekly updates about new features and tips",
    },
    marketing: {
      title: "Marketing communications",
      description: "Receive promotional emails and special offers",
    },
    terms: {
      title: "Accept terms and conditions",
      description: "Agree to our Terms of Service and Privacy Policy",
    },
  };

  const handleFieldChange = (key: keyof typeof fields) => (value: boolean) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const fieldKeys = Object.keys(fields) as Array<keyof typeof fields>;

  return (
    <View className="flex-1 items-center justify-center px-5">
      <Surface className="py-5 w-full">
        {fieldKeys.map((key, index) => (
          <React.Fragment key={key}>
            {index > 0 && <Separator className="my-4" />}
            <CheckboxField
              isSelected={fields[key]}
              onSelectedChange={handleFieldChange(key)}
              title={fieldConfigs[key].title}
              description={fieldConfigs[key].description}
            />
          </React.Fragment>
        ))}
      </Surface>
    </View>
  );
}
```

You can find more examples in the [GitHub repository](<https://github.com/heroui-inc/heroui-native/blob/main/example/src/app/(home)/components/checkbox.tsx>).

## API Reference

### Checkbox

| prop                    | type                                                                   | default     | description                                                               |
| ----------------------- | ---------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------- |
| `children`              | `React.ReactNode \| ((props: CheckboxRenderProps) => React.ReactNode)` | `undefined` | Child elements or render function to customize the checkbox               |
| `isSelected`            | `boolean`                                                              | `undefined` | Whether the checkbox is currently selected                                |
| `onSelectedChange`      | `(isSelected: boolean) => void`                                        | `undefined` | Callback fired when the checkbox selection state changes                  |
| `isDisabled`            | `boolean`                                                              | `false`     | Whether the checkbox is disabled and cannot be interacted with            |
| `isInvalid`             | `boolean`                                                              | `false`     | Whether the checkbox is invalid (shows danger color)                      |
| `variant`               | `'primary' \| 'secondary'`                                             | `'primary'` | Variant style for the checkbox                                            |
| `hitSlop`               | `number`                                                               | `6`         | Hit slop for the pressable area                                           |
| `animation`             | `CheckboxRootAnimation`                                                | -           | Animation configuration                                                   |
| `isAnimatedStyleActive` | `boolean`                                                              | `true`      | Whether animated styles (react-native-reanimated) are active              |
| `className`             | `string`                                                               | `undefined` | Additional CSS classes to apply                                           |
| `...PressableProps`     | `PressableProps`                                                       | -           | All standard React Native Pressable props are supported (except disabled) |

#### CheckboxRenderProps

| prop         | type      | description                      |
| ------------ | --------- | -------------------------------- |
| `isSelected` | `boolean` | Whether the checkbox is selected |
| `isInvalid`  | `boolean` | Whether the checkbox is invalid  |
| `isDisabled` | `boolean` | Whether the checkbox is disabled |

#### CheckboxRootAnimation

Animation configuration for checkbox root component. Can be:

- `false` or `"disabled"`: Disable only root animations
- `"disable-all"`: Disable all animations including children
- `true` or `undefined`: Use default animations
- `object`: Custom animation configuration

| prop                 | type                                     | default             | description                                     |
| -------------------- | ---------------------------------------- | ------------------- | ----------------------------------------------- |
| `state`              | `'disabled' \| 'disable-all' \| boolean` | -                   | Disable animations while customizing properties |
| `scale.value`        | `[number, number]`                       | `[1, 0.96]`         | Scale values [unpressed, pressed]               |
| `scale.timingConfig` | `WithTimingConfig`                       | `{ duration: 150 }` | Animation timing configuration                  |

### Checkbox.Indicator

| prop                    | type                                                                   | default     | description                                                  |
| ----------------------- | ---------------------------------------------------------------------- | ----------- | ------------------------------------------------------------ |
| `children`              | `React.ReactNode \| ((props: CheckboxRenderProps) => React.ReactNode)` | `undefined` | Content or render function for the checkbox indicator        |
| `className`             | `string`                                                               | `undefined` | Additional CSS classes for the indicator                     |
| `iconProps`             | `CheckboxIndicatorIconProps`                                           | `undefined` | Custom props for the default animated check icon             |
| `animation`             | `CheckboxIndicatorAnimation`                                           | -           | Animation configuration                                      |
| `isAnimatedStyleActive` | `boolean`                                                              | `true`      | Whether animated styles (react-native-reanimated) are active |
| `...AnimatedViewProps`  | `AnimatedProps<ViewProps>`                                             | -           | All standard React Native Animated View props are supported  |

#### CheckboxIndicatorIconProps

Props for customizing the default animated check icon.

| prop            | type     | description                                      |
| --------------- | -------- | ------------------------------------------------ |
| `size`          | `number` | Icon size                                        |
| `strokeWidth`   | `number` | Icon stroke width                                |
| `color`         | `string` | Icon color (defaults to theme accent-foreground) |
| `enterDuration` | `number` | Duration of enter animation (check appearing)    |
| `exitDuration`  | `number` | Duration of exit animation (check disappearing)  |

#### CheckboxIndicatorAnimation

Animation configuration for checkbox indicator component. Can be:

- `false` or `"disabled"`: Disable all animations
- `true` or `undefined`: Use default animations
- `object`: Custom animation configuration

| prop                        | type                    | default             | description                                     |
| --------------------------- | ----------------------- | ------------------- | ----------------------------------------------- |
| `state`                     | `'disabled' \| boolean` | -                   | Disable animations while customizing properties |
| `opacity.value`             | `[number, number]`      | `[0, 1]`            | Opacity values [unselected, selected]           |
| `opacity.timingConfig`      | `WithTimingConfig`      | `{ duration: 100 }` | Animation timing configuration                  |
| `borderRadius.value`        | `[number, number]`      | `[8, 0]`            | Border radius values [unselected, selected]     |
| `borderRadius.timingConfig` | `WithTimingConfig`      | `{ duration: 50 }`  | Animation timing configuration                  |
| `translateX.value`          | `[number, number]`      | `[-4, 0]`           | TranslateX values [unselected, selected]        |
| `translateX.timingConfig`   | `WithTimingConfig`      | `{ duration: 100 }` | Animation timing configuration                  |
| `scale.value`               | `[number, number]`      | `[0.8, 1]`          | Scale values [unselected, selected]             |
| `scale.timingConfig`        | `WithTimingConfig`      | `{ duration: 100 }` | Animation timing configuration                  |

## Hooks

### useCheckbox

Hook to access checkbox context values within custom components or compound components.

```tsx
import { useCheckbox } from "heroui-native";

const CustomIndicator = () => {
  const { isSelected, isInvalid, isDisabled } = useCheckbox();
  // ... your implementation
};
```

**Returns:** `UseCheckboxReturn`

| property           | type                                           | description                                                    |
| ------------------ | ---------------------------------------------- | -------------------------------------------------------------- |
| `isSelected`       | `boolean \| undefined`                         | Whether the checkbox is currently selected                     |
| `onSelectedChange` | `((isSelected: boolean) => void) \| undefined` | Callback function to change the checkbox selection state       |
| `isDisabled`       | `boolean`                                      | Whether the checkbox is disabled and cannot be interacted with |
| `isInvalid`        | `boolean`                                      | Whether the checkbox is invalid (shows danger color)           |
| `nativeID`         | `string \| undefined`                          | Native ID for the checkbox element                             |

**Note:** This hook must be used within a `Checkbox` component. It will throw an error if called outside of the checkbox context.
</page>

<page url="/en/docs/native/components/chip">
# Chip

**Category**: native
**URL**: https://www.heroui.com/en/docs/native/components/chip
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/en/native/components/(data-display)/chip.mdx

> Displays a compact element in a capsule shape.

---

<NativeVideoPlayerView
  target="auto"
  srcLight="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/chip-docs-light.mp4"
  srcDark="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/chip-docs-dark.mp4"
/>

## Import

```tsx
import { Chip } from "heroui-native";
```

## Anatomy

```tsx
<Chip>
  <Chip.Label>...</Chip.Label>
</Chip>
```

- **Chip**: Main container that displays a compact element
- **Chip.Label**: Text content of the chip

## Usage

### Basic Usage

The Chip component displays text or custom content in a capsule shape.

```tsx
<Chip>Basic Chip</Chip>
```

### Sizes

Control the chip size with the `size` prop.

```tsx
<Chip size="sm">Small</Chip>
<Chip size="md">Medium</Chip>
<Chip size="lg">Large</Chip>

```

### Variants

Choose between different visual styles with the `variant` prop.

```tsx
<Chip variant="primary">Primary</Chip>
<Chip variant="secondary">Secondary</Chip>
<Chip variant="tertiary">Tertiary</Chip>
<Chip variant="soft">Soft</Chip>

```

### Colors

Apply different color themes with the `color` prop.

```tsx
<Chip color="accent">Accent</Chip>
<Chip color="default">Default</Chip>
<Chip color="success">Success</Chip>
<Chip color="warning">Warning</Chip>
<Chip color="danger">Danger</Chip>

```

### With Icons

Add icons or custom content alongside text using compound components.

```tsx
<Chip>
  <Icon name="star" size={12} />
  <Chip.Label>Featured</Chip.Label>
</Chip>

<Chip>
  <Chip.Label>Close</Chip.Label>
  <Icon name="close" size={12} />
</Chip>

```

### Custom Styling

Apply custom styles using className or style props.

```tsx
<Chip className="bg-purple-600 px-6">
  <Chip.Label className="text-white">Custom</Chip.Label>
</Chip>
```

### Disable All Animations

Disable all animations including children by using the `"disable-all"` value for the `animation` prop.

```tsx
{
  /* Disable all animations including children */
}
<Chip animation="disable-all">No Animations</Chip>;
```

## Example

```tsx
import { Chip } from "heroui-native";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ChipExample() {
  return (
    <View className="gap-4 p-4">
      <View className="flex-row flex-wrap gap-2">
        <Chip size="sm">Small</Chip>
        <Chip size="md">Medium</Chip>
        <Chip size="lg">Large</Chip>
      </View>

      <View className="flex-row flex-wrap gap-2">
        <Chip variant="primary" color="accent">
          Primary
        </Chip>
        <Chip variant="secondary" color="success">
          <View className="size-1.5 rounded-full bg-success" />
          <Chip.Label>Success</Chip.Label>
        </Chip>
        <Chip variant="tertiary" color="warning">
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Chip.Label>Premium</Chip.Label>
        </Chip>
      </View>

      <View className="flex-row gap-2">
        <Chip variant="secondary">
          <Chip.Label>Remove</Chip.Label>
          <Ionicons name="close" size={14} color="#6B7280" />
        </Chip>
        <Chip className="bg-purple-600">
          <Chip.Label className="text-white font-semibold">Custom</Chip.Label>
        </Chip>
      </View>
    </View>
  );
}
```

You can find more examples in the [GitHub repository](<https://github.com/heroui-inc/heroui-native/blob/main/example/src/app/(home)/components/chip.tsx>).

## API Reference

### Chip

| prop                | type                                                          | default     | description                                                                               |
| ------------------- | ------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| `children`          | `React.ReactNode`                                             | -           | Content to render inside the chip                                                         |
| `size`              | `'sm' \| 'md' \| 'lg'`                                        | `'md'`      | Size of the chip                                                                          |
| `variant`           | `'primary' \| 'secondary' \| 'tertiary' \| 'soft'`            | `'primary'` | Visual variant of the chip                                                                |
| `color`             | `'accent' \| 'default' \| 'success' \| 'warning' \| 'danger'` | `'accent'`  | Color theme of the chip                                                                   |
| `className`         | `string`                                                      | -           | Additional CSS classes to apply                                                           |
| `animation`         | `"disable-all" \| undefined`                                  | `undefined` | Animation configuration. Use `"disable-all"` to disable all animations including children |
| `...PressableProps` | `PressableProps`                                              | -           | All Pressable props are supported                                                         |

### Chip.Label

| prop           | type              | default | description                            |
| -------------- | ----------------- | ------- | -------------------------------------- |
| `children`     | `React.ReactNode` | -       | Text or content to render as the label |
| `className`    | `string`          | -       | Additional CSS classes to apply        |
| `...TextProps` | `TextProps`       | -       | All standard Text props are supported  |

## Hooks

### useChip

Hook to access the Chip context values. Returns the chip's size, variant, and color.

```tsx
import { useChip } from "heroui-native";

const { size, variant, color } = useChip();
```

#### Return Value

| property  | type                                                          | description                |
| --------- | ------------------------------------------------------------- | -------------------------- |
| `size`    | `'sm' \| 'md' \| 'lg'`                                        | Size of the chip           |
| `variant` | `'primary' \| 'secondary' \| 'tertiary' \| 'soft'`            | Visual variant of the chip |
| `color`   | `'accent' \| 'default' \| 'success' \| 'warning' \| 'danger'` | Color theme of the chip    |

**Note:** This hook must be used within a `Chip` component. It will throw an error if called outside of the chip context.
</page>

<page url="/en/docs/native/components/close-button">
# CloseButton

**Category**: native
**URL**: https://www.heroui.com/en/docs/native/components/close-button
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/en/native/components/(buttons)/close-button.mdx

> Button component for closing dialogs, modals, or dismissing content.

---

<NativeVideoPlayerView
  target="auto"
  srcLight="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/close-button-docs-light.mp4"
  srcDark="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/close-button-docs-dark.mp4"
/>

## Import

```tsx
import { CloseButton } from "heroui-native";
```

## Usage

### Basic Usage

The CloseButton component renders a close icon button with default styling.

```tsx
<CloseButton />
```

### Custom Icon Color

Customize the icon color using the `iconProps` prop.

```tsx
<CloseButton iconProps={{ color: themeColorDanger }} />
<CloseButton iconProps={{ color: themeColorAccent }} />

```

### Custom Icon Size

Adjust the icon size using the `iconProps` prop.

```tsx
<CloseButton iconProps={{ size: 24 }} />
```

### Custom Children

Replace the default close icon with custom content.

```tsx
<CloseButton>
  <CustomIcon />
</CloseButton>
```

### Disabled State

Disable the button to prevent interactions.

```tsx
<CloseButton isDisabled />
```

## Example

```tsx
import { CloseButton, useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { withUniwind } from "uniwind";

const StyledIonicons = withUniwind(Ionicons);

export default function CloseButtonExample() {
  const themeColorForeground = useThemeColor("foreground");
  const themeColorDanger = useThemeColor("danger");

  return (
    <View className="flex-1 px-5 items-center justify-center">
      <View className="flex-row items-center gap-4">
        <CloseButton />
        <CloseButton iconProps={{ color: themeColorDanger }} />
        <CloseButton>
          <StyledIonicons
            name="close-circle"
            size={28}
            color={themeColorForeground}
          />
        </CloseButton>
        <CloseButton isDisabled />
      </View>
    </View>
  );
}
```

You can find more examples in the [GitHub repository](<https://github.com/heroui-inc/heroui-native/blob/main/example/src/app/(home)/components/close-button.tsx>).

## API Reference

### CloseButton

CloseButton extends all props from [Button](./button) component. It defaults to `variant='tertiary'`, `size='sm'`, and `isIconOnly=true`.

| prop        | type                   | default | description                                      |
| ----------- | ---------------------- | ------- | ------------------------------------------------ |
| `iconProps` | `CloseButtonIconProps` | -       | Props for customizing the close icon             |
| `children`  | `React.ReactNode`      | -       | Custom content to replace the default close icon |

For inherited props including `isDisabled`, `className`, `animation`, `feedbackVariant` and all Pressable props, see [Button API Reference](./button#api-reference).

#### CloseButtonIconProps

| prop    | type     | default                | description       |
| ------- | -------- | ---------------------- | ----------------- |
| `size`  | `number` | `20`                   | Size of the icon  |
| `color` | `string` | Uses theme muted color | Color of the icon |

</page>

<page url="/en/docs/native/components/control-field">
# ControlField

**Category**: native
**URL**: https://www.heroui.com/en/docs/native/components/control-field
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/en/native/components/(forms)/control-field.mdx

> A field component that combines a label, description (or other content), and a control component (Switch or Checkbox) into a single pressable area.

---

<NativeVideoPlayerView
  target="auto"
  srcLight="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/control-field-docs-light.mp4"
  srcDark="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/control-field-docs-dark.mp4"
/>

## Import

```tsx
import { ControlField } from "heroui-native";
```

## Anatomy

```tsx
<ControlField>
  <Label>...</Label>
  <Description>...</Description>
  <ControlField.Indicator>...</ControlField.Indicator>
  <FieldError>...</FieldError>
</ControlField>
```

- **ControlField**: Root container that manages layout and state propagation
- **Label**: Primary text label for the control (from [Label](./label) component)
- **Description**: Secondary descriptive helper text (from [Description](./description) component)
- **ControlField.Indicator**: Container for the form control component ([Switch](./switch), [Checkbox](./checkbox), [Radio](./radio))
- **FieldError**: Validation error message display (from [FieldError](./field-error) component)

## Usage

### Basic Usage

ControlField wraps form controls to provide consistent layout and state management.

```tsx
<ControlField isSelected={value} onSelectedChange={setValue}>
  <Label className="flex-1">Label text</Label>
  <ControlField.Indicator />
</ControlField>
```

### With Description

Add helper text below the label using the Description component.

```tsx
<ControlField isSelected={value} onSelectedChange={setValue}>
  <View className="flex-1">
    <Label>Enable notifications</Label>
    <Description>
      Receive push notifications about your account activity
    </Description>
  </View>
  <ControlField.Indicator />
</ControlField>
```

### With Error Message

Display validation errors using the ErrorMessage component.

```tsx
<ControlField
  isSelected={value}
  onSelectedChange={setValue}
  isInvalid={!value}
  className="flex-col items-start gap-1"
>
  <View className="flex-row items-center gap-2">
    <View className="flex-1">
      <Label>I agree to the terms</Label>
      <Description>
        By checking this box, you agree to our Terms of Service
      </Description>
    </View>
    <ControlField.Indicator variant="checkbox" />
  </View>
  <FieldError>This field is required</FieldError>
</ControlField>
```

### Disabled State

Control interactivity with the disabled prop.

```tsx
<ControlField isSelected={value} onSelectedChange={setValue} isDisabled>
  <View className="flex-1">
    <Label>Disabled field</Label>
    <Description>This field is disabled</Description>
  </View>
  <ControlField.Indicator />
</ControlField>
```

### Disabling All Animations

Disable all animations including children by using `"disable-all"`. This cascades down to all child components.

```tsx
<ControlField
  isSelected={value}
  onSelectedChange={setValue}
  animation="disable-all"
>
  <View className="flex-1">
    <Label>Label text</Label>
    <Description>Description text</Description>
  </View>
  <ControlField.Indicator />
</ControlField>
```

## Example

```tsx
import {
  Checkbox,
  Description,
  FieldError,
  ControlField,
  Label,
  Switch,
} from "heroui-native";
import React from "react";
import { ScrollView, View } from "react-native";

export default function ControlFieldExample() {
  const [notifications, setNotifications] = React.useState(false);
  const [terms, setTerms] = React.useState(false);
  const [newsletter, setNewsletter] = React.useState(true);

  return (
    <ScrollView className="bg-background p-4">
      <View className="gap-4">
        <ControlField
          isSelected={notifications}
          onSelectedChange={setNotifications}
        >
          <View className="flex-1">
            <Label>Enable notifications</Label>
            <Description>
              Receive push notifications about your account activity
            </Description>
          </View>
          <ControlField.Indicator />
        </ControlField>

        <ControlField
          isSelected={terms}
          onSelectedChange={setTerms}
          isInvalid={!terms}
          className="flex-col items-start gap-1"
        >
          <View className="flex-row items-center gap-2">
            <View className="flex-1">
              <Label>I agree to the terms and conditions</Label>
              <Description>
                By checking this box, you agree to our Terms of Service
              </Description>
            </View>
            <ControlField.Indicator className="mt-0.5">
              <Checkbox />
            </ControlField.Indicator>
          </View>
          <FieldError>This field is required</FieldError>
        </ControlField>

        <ControlField isSelected={newsletter} onSelectedChange={setNewsletter}>
          <View className="flex-1">
            <Label>Subscribe to newsletter</Label>
          </View>
          <ControlField.Indicator>
            <Checkbox color="warning" />
          </ControlField.Indicator>
        </ControlField>
      </View>
    </ScrollView>
  );
}
```

You can find more examples in the [GitHub repository](<https://github.com/heroui-inc/heroui-native/blob/main/example/src/app/(home)/components/control-field.tsx>).

## API Reference

### ControlField

| prop              | type                                                                       | default     | description                                                                               |
| ----------------- | -------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| children          | `React.ReactNode \| ((props: ControlFieldRenderProps) => React.ReactNode)` | -           | Content to render inside the form control, or a render function                           |
| isSelected        | `boolean`                                                                  | `undefined` | Whether the control is selected/checked                                                   |
| isDisabled        | `boolean`                                                                  | `false`     | Whether the form control is disabled                                                      |
| isInvalid         | `boolean`                                                                  | `false`     | Whether the form control is invalid                                                       |
| isRequired        | `boolean`                                                                  | `false`     | Whether the form control is required                                                      |
| className         | `string`                                                                   | -           | Custom class name for the root element                                                    |
| onSelectedChange  | `(isSelected: boolean) => void`                                            | -           | Callback when selection state changes                                                     |
| animation         | `"disable-all" \| undefined`                                               | `undefined` | Animation configuration. Use `"disable-all"` to disable all animations including children |
| ...PressableProps | `PressableProps`                                                           | -           | All React Native Pressable props are supported                                            |

### Label

The `Label` component automatically consumes form state (`isDisabled`, `isInvalid`) from the ControlField context.

**Note**: For complete prop documentation, see the [Label component documentation](./label).

### Description

The `Description` component automatically consumes form state (`isDisabled`, `isInvalid`) from the ControlField context.

**Note**: For complete prop documentation, see the [Description component documentation](./description).

### ControlField.Indicator

| prop         | type                                | default    | description                                                |
| ------------ | ----------------------------------- | ---------- | ---------------------------------------------------------- |
| children     | `React.ReactNode`                   | -          | Control component to render (Switch, Checkbox, Radio)      |
| variant      | `'checkbox' \| 'radio' \| 'switch'` | `'switch'` | Variant of the control to render when no children provided |
| className    | `string`                            | -          | Custom class name for the indicator element                |
| ...ViewProps | `ViewProps`                         | -          | All React Native View props are supported                  |

**Note**: When children are provided, the component automatically passes down `isSelected`, `onSelectedChange`, `isDisabled`, and `isInvalid` props from the ControlField context if they are not already present on the child component. When using the `radio` variant, the Radio component renders in standalone mode (outside of a RadioGroup).

### FieldError

The `FieldError` component automatically consumes form state (`isInvalid`) from the ControlField context.

**Note**: For complete prop documentation, see the [FieldError component documentation](./field-error). The error message visibility is controlled by the `isInvalid` state of the parent ControlField.

## Hooks

### useControlField

**Returns:**

| property           | type                                           | description                                    |
| ------------------ | ---------------------------------------------- | ---------------------------------------------- |
| `isSelected`       | `boolean \| undefined`                         | Whether the control is selected/checked        |
| `onSelectedChange` | `((isSelected: boolean) => void) \| undefined` | Callback when selection state changes          |
| `isDisabled`       | `boolean`                                      | Whether the form control is disabled           |
| `isInvalid`        | `boolean`                                      | Whether the form control is invalid            |
| `isPressed`        | `SharedValue<boolean>`                         | Reanimated shared value indicating press state |

</page>

<page url="/en/docs/native/components/description">
# Description

**Category**: native
**URL**: https://www.heroui.com/en/docs/native/components/description
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/en/native/components/(forms)/description.mdx

> Text component for providing accessible descriptions and helper text for form fields and other UI elements.

---

<NativeVideoPlayerView
  target="auto"
  srcLight="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/description-docs-light.mp4"
  srcDark="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/description-docs-dark.mp4"
/>

## Import

```tsx
import { Description } from "heroui-native";
```

## Anatomy

```tsx
<Description>...</Description>
```

- **Description**: Text component that displays description or helper text with muted styling. Can be linked to form fields via `nativeID` for accessibility support.

## Usage

### Basic Usage

Display description text with default muted styling.

```tsx
<Description>This is a helpful description.</Description>
```

### With Form Fields

Provide accessible descriptions for form fields using the `nativeID` prop.

```tsx
<TextField>
  <Label>Email address</Label>
  <Input
    placeholder="Enter your email"
    keyboardType="email-address"
    autoCapitalize="none"
  />
  <Description nativeID="email-desc">
    We'll never share your email with anyone else.
  </Description>
</TextField>
```

### Accessibility Linking

Link descriptions to form fields for screen reader support by using `nativeID` and `aria-describedby`.

```tsx
<TextField>
  <Label>Password</Label>
  <Input
    placeholder="Create a password"
    secureTextEntry
    aria-describedby="password-desc"
  />
  <Description nativeID="password-desc">
    Use at least 8 characters with a mix of letters, numbers, and symbols.
  </Description>
</TextField>
```

### Hiding on Invalid State

Control whether the description should be hidden when the form field is invalid using the `hideOnInvalid` prop.

```tsx
<TextField isInvalid={isInvalid}>
  <Label>Email</Label>
  <Input placeholder="Enter your email" />
  <Description hideOnInvalid>
    We'll never share your email with anyone else.
  </Description>
  <FieldError>Please enter a valid email address</FieldError>
</TextField>
```

When `hideOnInvalid` is `true`, the description will be hidden when the field is invalid. When `false` (default), the description remains visible even when invalid.

## Example

```tsx
import { Description, TextField } from "heroui-native";
import { View } from "react-native";

export default function DescriptionExample() {
  return (
    <View className="flex-1 justify-center px-5 gap-8">
      <TextField>
        <Label>Email address</Label>
        <Input
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Description nativeID="email-desc">
          We'll never share your email with anyone else.
        </Description>
      </TextField>
      <TextField>
        <Label>Password</Label>
        <Input placeholder="Create a password" secureTextEntry />
        <Description nativeID="password-desc">
          Use at least 8 characters with a mix of letters, numbers, and symbols.
        </Description>
      </TextField>
    </View>
  );
}
```

You can find more examples in the [GitHub repository](<https://github.com/heroui-inc/heroui-native/blob/main/example/src/app/(home)/components/description.tsx>).

## API Reference

### Description

| prop            | type                                | default | description                                                                                |
| --------------- | ----------------------------------- | ------- | ------------------------------------------------------------------------------------------ |
| `children`      | `React.ReactNode`                   | -       | Description text content                                                                   |
| `className`     | `string`                            | -       | Additional CSS classes to apply                                                            |
| `nativeID`      | `string`                            | -       | Native ID for accessibility. Used to link description to form fields via aria-describedby. |
| `isInvalid`     | `boolean`                           | -       | Whether the description is in an invalid state (overrides context)                         |
| `isDisabled`    | `boolean`                           | -       | Whether the description is disabled (overrides context)                                    |
| `hideOnInvalid` | `boolean`                           | `false` | Whether to hide the description when invalid                                               |
| `animation`     | `DescriptionAnimation \| undefined` | -       | Animation configuration for description transitions                                        |
| `...TextProps`  | `TextProps`                         | -       | All standard React Native Text props are supported                                         |

</page>

<page url="/en/docs/native/components/field-error">
# FieldError

**Category**: native
**URL**: https://www.heroui.com/en/docs/native/components/field-error
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/en/native/components/(forms)/field-error.mdx

> Displays validation error message content with smooth animations.

---

<NativeVideoPlayerView
  target="auto"
  srcLight="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/field-error-docs-light.mp4"
  srcDark="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/field-error-docs-dark.mp4"
/>

## Import

```tsx
import { FieldError } from "heroui-native";
```

## Anatomy

```tsx
<FieldError>Error message content</FieldError>
```

- **FieldError**: Main container that displays error messages with smooth animations. Accepts string children which are automatically wrapped with Text component, or custom React components for more complex layouts. Controls visibility through the `isInvalid` prop and supports custom entering/exiting animations.

## Usage

### Basic Usage

The FieldError component displays error messages when validation fails.

```tsx
<FieldError isInvalid={true}>This field is required</FieldError>
```

### Controlled Visibility

Control when the error appears using the `isInvalid` prop. When used inside a form field component (like TextField), FieldError automatically consumes the form-item-state context.

```tsx
const [isInvalid, setIsInvalid] = useState(false);

<FieldError isInvalid={isInvalid}>
  Please enter a valid email address
</FieldError>;
```

### With Form Fields

FieldError automatically consumes form state from TextField via the form-item-state context.

```tsx
import { FieldError, Label, TextField } from "heroui-native";

<TextField isRequired isInvalid={true}>
  <Label>Email</Label>
  <Input placeholder="Enter your email" />
  <FieldError>Please enter a valid email address</FieldError>
</TextField>;
```

### Custom Content

Pass custom React components as children instead of strings.

```tsx
<FieldError isInvalid={true}>
  <View className="flex-row items-center">
    <Icon name="alert-circle" />
    <Text className="ml-2 text-danger">Invalid input</Text>
  </View>
</FieldError>
```

### Custom Animations

Override default entering and exiting animations using the `animation` prop.

```tsx
import { SlideInDown, SlideOutUp } from "react-native-reanimated";

<FieldError
  isInvalid={true}
  animation={{
    entering: { value: SlideInDown.duration(200) },
    exiting: { value: SlideOutUp.duration(150) },
  }}
>
  Field validation failed
</FieldError>;
```

Disable animations entirely:

```tsx
<FieldError isInvalid={true} animation={false}>
  Field validation failed
</FieldError>
```

### Custom Styling

Apply custom styles to the container and text elements.

```tsx
<FieldError
  isInvalid={true}
  className="mt-2"
  classNames={{
    container: "bg-danger/10 p-2 rounded",
    text: "text-xs font-medium",
  }}
>
  Password must be at least 8 characters
</FieldError>
```

### Custom Text Props

Pass additional props to the Text component when children is a string.

```tsx
<FieldError
  isInvalid={true}
  textProps={{
    numberOfLines: 1,
    ellipsizeMode: "tail",
    style: { letterSpacing: 0.5 },
  }}
>
  This is a very long error message that might need to be truncated
</FieldError>
```

## Example

```tsx
import { Description, FieldError, Label, TextField } from "heroui-native";
import { useState } from "react";
import { View } from "react-native";

export default function FieldErrorExample() {
  const [email, setEmail] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleBlur = () => {
    setIsInvalid(email !== "" && !isValidEmail);
  };

  return (
    <View className="p-4">
      <TextField isInvalid={isInvalid}>
        <Label>Email Address</Label>
        <Input
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          onBlur={handleBlur}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Description>We'll use this to contact you</Description>
        <FieldError>Please enter a valid email address</FieldError>
      </TextField>
    </View>
  );
}
```

You can find more examples in the [GitHub repository](<https://github.com/heroui-inc/heroui-native/blob/main/example/src/app/(home)/components/field-error.tsx>).

## API Reference

### FieldError

| prop                   | type                                          | default     | description                                                                                                                                   |
| ---------------------- | --------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `children`             | `React.ReactNode`                             | `undefined` | The content of the error field. String children are wrapped with Text                                                                         |
| `isInvalid`            | `boolean`                                     | `undefined` | Controls the visibility of the error field (overrides form-item-state context). When used inside TextField, automatically consumes form state |
| `animation`            | `FieldErrorRootAnimation`                     | -           | Animation configuration                                                                                                                       |
| `className`            | `string`                                      | `undefined` | Additional CSS classes for the container                                                                                                      |
| `classNames`           | `ElementSlots<FieldErrorSlots>`               | `undefined` | Additional CSS classes for different parts of the component                                                                                   |
| `styles`               | `{ container?: ViewStyle; text?: TextStyle }` | `undefined` | Styles for different parts of the field error                                                                                                 |
| `textProps`            | `TextProps`                                   | `undefined` | Additional props to pass to the Text component when children is a string                                                                      |
| `...AnimatedViewProps` | `AnimatedProps<ViewProps>`                    | -           | All Reanimated Animated.View props are supported                                                                                              |

**classNames prop:** `ElementSlots<FieldErrorSlots>` provides type-safe CSS classes for different parts of the field error component. Available slots: `container`, `text`.

#### `styles`

| prop        | type        | description                 |
| ----------- | ----------- | --------------------------- |
| `container` | `ViewStyle` | Styles for the container    |
| `text`      | `TextStyle` | Styles for the text content |

#### FieldErrorRootAnimation

Animation configuration for field error root component. Can be:

- `false` or `"disabled"`: Disable only root animations
- `"disable-all"`: Disable all animations including children
- `true` or `undefined`: Use default animations
- `object`: Custom animation configuration

| prop             | type                                     | default                                                               | description                                     |
| ---------------- | ---------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------- |
| `state`          | `'disabled' \| 'disable-all' \| boolean` | -                                                                     | Disable animations while customizing properties |
| `entering.value` | `EntryOrExitLayoutType`                  | `FadeIn`<br/>`.duration(150)`<br/>`.easing(Easing.out(Easing.ease))`  | Custom entering animation for field error       |
| `exiting.value`  | `EntryOrExitLayoutType`                  | `FadeOut`<br/>`.duration(100)`<br/>`.easing(Easing.out(Easing.ease))` | Custom exiting animation for field error        |

</page>

<page url="/en/docs/native/components/input">
# Input

**Category**: native
**URL**: https://www.heroui.com/en/docs/native/components/input
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/en/native/components/(forms)/input.mdx

> A text input component with styled border and background for collecting user input.

---

<NativeVideoPlayerView
  target="auto"
  srcLight="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/input-docs-light.mp4"
  srcDark="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/input-docs-dark.mp4"
/>

## Import

```tsx
import { Input } from "heroui-native";
```

## Usage

### Basic Usage

Input can be used standalone or within a TextField component.

```tsx
import { Input } from "heroui-native";

<Input placeholder="Enter your email" />;
```

### Within TextField

Input works seamlessly with TextField for complete form structure.

```tsx
import { Input, Label, TextField } from "heroui-native";

<TextField>
  <Label>Email</Label>
  <Input placeholder="Enter your email" />
</TextField>;
```

### With Validation

Display error state when the input is invalid.

```tsx
import { FieldError, Input, Label, TextField } from "heroui-native";

<TextField isRequired isInvalid={true}>
  <Label>Email</Label>
  <Input placeholder="Enter your email" />
  <FieldError>Please enter a valid email</FieldError>
</TextField>;
```

### With Local Invalid State Override

Override the context's invalid state for the input.

```tsx
import { FieldError, Input, Label, TextField } from "heroui-native";

<TextField isInvalid={true}>
  <Label isInvalid={false}>Email</Label>
  <Input placeholder="Enter your email" isInvalid={false} />
  <FieldError>Email format is incorrect</FieldError>
</TextField>;
```

### Disabled State

Disable the input to prevent interaction.

```tsx
import { Input, Label, TextField } from "heroui-native";

<TextField isDisabled>
  <Label>Disabled Field</Label>
  <Input placeholder="Cannot edit" value="Read only value" />
</TextField>;
```

### With Variant

Use different variants to style the input based on context.

```tsx
import { Input, Label, TextField } from 'heroui-native';

<TextField>
  <Label>Primary Variant</Label>
  <Input placeholder="Primary style" variant="primary" />
</TextField>

<TextField>
  <Label>Secondary Variant</Label>
  <Input placeholder="Secondary style" variant="secondary" />
</TextField>

```

### Custom Styling

Customize the input appearance using className.

```tsx
import { Input, Label, TextField } from "heroui-native";

<TextField>
  <Label>Custom Styled</Label>
  <Input
    placeholder="Custom colors"
    className="bg-blue-50 border-blue-500 focus:border-blue-700"
  />
</TextField>;
```

### Inside a Bottom Sheet

When rendering an Input inside a `BottomSheet`, use the `useBottomSheetAwareHandlers` hook to wire keyboard avoidance handlers. Pass the returned `onFocus` and `onBlur` to the Input.

> **Note**: `useBottomSheetAwareHandlers` must be used inside a `BottomSheet`. Call it from a child component rendered inside `BottomSheet.Content` — outside of a `BottomSheet` context the returned handlers are no-ops.

```tsx
import { Input, TextField, useBottomSheetAwareHandlers } from "heroui-native";

const BottomSheetTextInput = () => {
  const { onFocus, onBlur } = useBottomSheetAwareHandlers();

  return (
    <TextField>
      <Input placeholder="Type here..." onFocus={onFocus} onBlur={onBlur} />
    </TextField>
  );
};
```

## Example

```tsx
import { Ionicons } from "@expo/vector-icons";
import { Description, Input, Label, TextField } from "heroui-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledIonicons = withUniwind(Ionicons);

export const TextInputContent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View className="gap-4">
      <TextField isRequired>
        <Label>Email</Label>
        <Input
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <Description>
          We'll never share your email with anyone else.
        </Description>
      </TextField>

      <TextField isRequired>
        <Label>New password</Label>
        <View className="w-full flex-row items-center">
          <Input
            value={password}
            onChangeText={setPassword}
            className="flex-1 px-10"
            placeholder="Enter your password"
            secureTextEntry={!isPasswordVisible}
          />
          <StyledIonicons
            name="lock-closed-outline"
            size={16}
            className="absolute left-3.5 text-muted"
            pointerEvents="none"
          />
          <Pressable
            className="absolute right-4"
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <StyledIonicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={16}
              className="text-muted"
            />
          </Pressable>
        </View>
        <Description>Password must be at least 6 characters</Description>
      </TextField>
    </View>
  );
};
```

You can find more examples in the [GitHub repository](<https://github.com/heroui-inc/heroui-native/blob/main/example/src/app/(home)/components/input.tsx>).

## API Reference

### Input

| prop                      | type                       | default               | description                                                                                                          |
| ------------------------- | -------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| isInvalid                 | `boolean`                  | `undefined`           | Whether the input is in an invalid state (overrides context)                                                         |
| variant                   | `'primary' \| 'secondary'` | `'primary'`           | Variant style for the input                                                                                          |
| className                 | `string`                   | -                     | Custom class name for the input                                                                                      |
| selectionColorClassName   | `string`                   | `"accent-accent"`     | Custom className for the selection color                                                                             |
| placeholderColorClassName | `string`                   | `"field-placeholder"` | Custom className for the placeholder text color                                                                      |
| isBottomSheetAware        | `boolean`                  | `true`                | Whether the input automatically handles keyboard state when rendered inside a BottomSheet. Set to `false` to disable |
| animation                 | `AnimationRoot`            | `undefined`           | Animation configuration for the input                                                                                |
| ...TextInputProps         | `TextInputProps`           | -                     | All standard React Native TextInput props are supported                                                              |

> **Note**: When used within a TextField component, Input automatically consumes form state (isDisabled, isInvalid) from TextField via the form-item-state context.
> </page>

<page url="/en/docs/native/components/label">
# Label

**Category**: native
**URL**: https://www.heroui.com/en/docs/native/components/label
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/en/native/components/(forms)/label.mdx

> Text component for labeling form fields and other UI elements with support for required indicators and validation states.

---

<NativeVideoPlayerView
  target="auto"
  srcLight="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/label-docs-light.mp4"
  srcDark="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/label-docs-dark.mp4"
/>

## Import

```tsx
import { Label } from "heroui-native";
```

## Anatomy

```tsx
<Label>
  <Label.Text>...</Label.Text>
</Label>
```

- **Label**: Root container that manages label state and provides context to child components. When string children are provided, automatically renders as Label.Text. Supports disabled, required, and invalid states.
- **Label.Text**: Text content of the label. Displays the label text and automatically shows an asterisk when the label is required. Changes color when invalid or disabled.

## Usage

### Basic Usage

Display a label with text content. String children are automatically rendered as Label.Text.

```tsx
<Label>Username</Label>
```

### With Form Fields

Use Label with form fields to provide accessible labels.

```tsx
<TextField>
  <Label>Username</Label>
  <Input placeholder="Choose a username" />
</TextField>
```

### Required Fields

Show an asterisk indicator for required fields using the `isRequired` prop.

```tsx
<TextField>
  <Label isRequired>Password</Label>
  <Input placeholder="Create a password" secureTextEntry />
</TextField>
```

### Invalid State

Display labels in an invalid state to indicate validation errors.

```tsx
import { FieldError, Label, TextField } from "heroui-native";

<TextField isInvalid>
  <Label isInvalid>Confirm password</Label>
  <Input
    placeholder="Confirm your password"
    secureTextEntry
    value="different"
    editable={false}
  />
  <FieldError>Passwords do not match</FieldError>
</TextField>;
```

### Disabled State

Disable labels to indicate non-interactive fields.

```tsx
<TextField isDisabled>
  <Label>Subscription plan</Label>
  <Input value="Premium" />
</TextField>
```

### Custom Layout

Use compound components for custom label layouts.

```tsx
<Label>
  <Label.Text>Custom label</Label.Text>
</Label>
```

### Custom Styling

Apply custom styles using className, classNames, or styles props.

```tsx
<Label className="mb-2">
  <Label.Text
    className="text-lg"
    classNames={{
      text: "font-bold",
      asterisk: "text-danger",
    }}
  >
    Custom styled label
  </Label.Text>
</Label>
```

## Example

```tsx
import { FieldError, Label, TextField } from "heroui-native";
import { View } from "react-native";

export default function LabelExample() {
  return (
    <View className="flex-1 justify-center px-5 gap-8">
      <TextField>
        <Label>Username</Label>
        <Input placeholder="Choose a username" />
      </TextField>
      <TextField>
        <Label isRequired>Password</Label>
        <Input placeholder="Create a password" secureTextEntry />
      </TextField>
      <TextField isInvalid>
        <Label isInvalid>Confirm password</Label>
        <Input
          placeholder="Confirm your password"
          secureTextEntry
          value="different"
          editable={false}
        />
        <FieldError>Passwords do not match</FieldError>
      </TextField>
      <TextField isDisabled>
        <Label>Subscription plan</Label>
        <Input value="Premium" />
      </TextField>
    </View>
  );
}
```

You can find more examples in the [GitHub repository](<https://github.com/heroui-inc/heroui-native/blob/main/example/src/app/(home)/components/label.tsx>).

## API Reference

### Label

| prop                | type                         | default     | description                                                                                                   |
| ------------------- | ---------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------- |
| `children`          | `React.ReactNode`            | -           | Label content. When string is provided, automatically renders as Label.Text. Otherwise renders children as-is |
| `isRequired`        | `boolean`                    | `false`     | Whether the label is required. Shows asterisk indicator when true                                             |
| `isInvalid`         | `boolean`                    | `false`     | Whether the label is in an invalid state. Changes text color to danger                                        |
| `isDisabled`        | `boolean`                    | `false`     | Whether the label is disabled. Applies disabled styling and prevents interaction                              |
| `className`         | `string`                     | -           | Additional CSS classes to apply                                                                               |
| `animation`         | `"disable-all" \| undefined` | `undefined` | Animation configuration. Use `"disable-all"` to disable all animations including children                     |
| `...PressableProps` | `PressableProps`             | -           | All standard React Native Pressable props are supported                                                       |

### Label.Text

| prop           | type                                     | default | description                                                                        |
| -------------- | ---------------------------------------- | ------- | ---------------------------------------------------------------------------------- |
| `children`     | `React.ReactNode`                        | -       | Label text content                                                                 |
| `className`    | `string`                                 | -       | Additional CSS classes to apply to the text element                                |
| `classNames`   | `ElementSlots<LabelSlots>`               | -       | Additional CSS classes for different parts of the label                            |
| `styles`       | `Partial<Record<LabelSlots, TextStyle>>` | -       | Styles for different parts of the label                                            |
| `nativeID`     | `string`                                 | -       | Native ID for accessibility. Used to link label to form fields via aria-labelledby |
| `...TextProps` | `TextProps`                              | -       | All standard React Native Text props are supported                                 |

#### `ElementSlots<LabelSlots>`

| prop       | type     | description                    |
| ---------- | -------- | ------------------------------ |
| `text`     | `string` | CSS classes for the label text |
| `asterisk` | `string` | CSS classes for the asterisk   |

#### `styles`

| prop       | type        | description               |
| ---------- | ----------- | ------------------------- |
| `text`     | `TextStyle` | Styles for the label text |
| `asterisk` | `TextStyle` | Styles for the asterisk   |

</page>

<page url="/en/docs/native/components/link-button">
# LinkButton

**Category**: native
**URL**: https://www.heroui.com/en/docs/native/components/link-button
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/en/native/components/(buttons)/link-button.mdx

> A ghost-variant button with no highlight feedback, designed for inline link-style interactions.

---

<NativeVideoPlayerView
  target="auto"
  srcLight="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/link-button-docs-light.mp4"
  srcDark="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/link-button-docs-dark.mp4"
/>

## Import

```tsx
import { LinkButton } from "heroui-native";
```

## Anatomy

```tsx
<LinkButton>
  <LinkButton.Label>...</LinkButton.Label>
</LinkButton>
```

- **LinkButton**: Root pressable container. Renders a `Button` with the `ghost` variant and disabled highlight feedback enforced internally. These cannot be overridden by consumers.
- **LinkButton.Label**: Text content of the link button. Inherits size and variant styling from the parent context.

## Usage

### Basic Usage

The LinkButton component renders inline link-style text that responds to press events.

```tsx
<LinkButton onPress={handlePress}>Learn more</LinkButton>
```

### Sizes

Control the text size with the `size` prop.

```tsx
<LinkButton size="sm">
  Small
</LinkButton>

<LinkButton size="md">
  Medium
</LinkButton>

<LinkButton size="lg">
  Large
</LinkButton>

```

### Disabled State

Disable the link button to prevent interaction.

```tsx
<LinkButton isDisabled>Disabled link</LinkButton>
```

### Custom Styling

Apply custom styles using the `className` prop on both root and label.

```tsx
<LinkButton className="px-2">
  <LinkButton.Label className="text-accent underline">
    Styled link
  </LinkButton.Label>
</LinkButton>
```

### Inline with Text

Place link buttons inline alongside regular text for terms, policies, or contextual navigation.

```tsx
<View className="flex-row flex-wrap">
  <Text className="text-sm text-muted">I agree to the </Text>
  <LinkButton size="sm" onPress={handleTermsPress}>
    <LinkButton.Label className="text-accent">
      Terms of Service
    </LinkButton.Label>
  </LinkButton>
  <Text className="text-sm text-muted"> and </Text>
  <LinkButton size="sm" onPress={handlePrivacyPress}>
    <LinkButton.Label className="text-accent">Privacy Policy</LinkButton.Label>
  </LinkButton>
</View>
```

## Example

```tsx
import { Button, Checkbox, ControlField, LinkButton } from "heroui-native";
import React from "react";
import { Alert, View } from "react-native";

export default function LinkButtonExample() {
  const [isAgreed, setIsAgreed] = React.useState(false);

  const handleTermsPress = () => Alert.alert("Terms", "Navigate to Terms");
  const handlePrivacyPress = () =>
    Alert.alert("Privacy", "Navigate to Privacy Policy");

  return (
    <View className="flex-1 px-5 items-center justify-center">
      <View className="w-full max-w-xs gap-6">
        <ControlField
          isSelected={isAgreed}
          onSelectedChange={setIsAgreed}
          className="items-start"
        >
          <ControlField.Indicator>
            <Checkbox className="mt-0.5" />
          </ControlField.Indicator>
          <View className="flex-row flex-wrap flex-1">
            <Text className="text-sm text-muted">I agree to the </Text>
            <LinkButton size="sm" onPress={handleTermsPress}>
              <LinkButton.Label className="text-accent">
                Terms of Service
              </LinkButton.Label>
            </LinkButton>
            <Text className="text-sm text-muted"> and </Text>
            <LinkButton size="sm" onPress={handlePrivacyPress}>
              <LinkButton.Label className="text-accent">
                Privacy Policy
              </LinkButton.Label>
            </LinkButton>
          </View>
        </ControlField>
        <Button isDisabled={!isAgreed}>Sign up</Button>
      </View>
    </View>
  );
}
```

You can find more examples in the [GitHub repository](<https://github.com/heroui-inc/heroui-native/blob/main/example/src/app/(home)/components/link-button.tsx>).

## API Reference

### LinkButton

Extends all [Button](./button#button) props except `variant` (enforced as `ghost` internally).

**Behavioral overrides applied internally:**

| override    | value        | description                                         |
| ----------- | ------------ | --------------------------------------------------- |
| `variant`   | `ghost`      | Always renders as a ghost button, cannot be changed |
| `highlight` | `false`      | Highlight feedback is disabled, cannot be changed   |
| `className` | `h-auto p-0` | Removes default button height and padding           |

### LinkButton.Label

Equivalent to [Button.Label](./button#buttonlabel). Accepts the same props.
</page>

<page url="/en/docs/native/components/list-group">
# ListGroup

**Category**: native
**URL**: https://www.heroui.com/en/docs/native/components/list-group
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/en/native/components/(navigation)/list-group.mdx

> A Surface-based container that groups related list items with consistent layout and spacing.

---

<NativeVideoPlayerView
  target="auto"
  srcLight="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/list-group-docs-light.mp4"
  srcDark="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/list-group-docs-dark.mp4"
/>

## Import

```tsx
import { ListGroup } from "heroui-native";
```

## Anatomy

```tsx
<ListGroup>
  <ListGroup.Item>
    <ListGroup.ItemPrefix>...</ListGroup.ItemPrefix>
    <ListGroup.ItemContent>
      <ListGroup.ItemTitle>...</ListGroup.ItemTitle>
      <ListGroup.ItemDescription>...</ListGroup.ItemDescription>
    </ListGroup.ItemContent>
    <ListGroup.ItemSuffix />
  </ListGroup.Item>
</ListGroup>
```

- **ListGroup**: Surface-based root container that groups related list items. Supports all Surface variants (default, secondary, tertiary, transparent).
- **ListGroup.Item**: Pressable horizontal flex-row container for a single item, providing consistent spacing and alignment.
- **ListGroup.ItemPrefix**: Optional leading content slot for icons, avatars, or other visual elements.
- **ListGroup.ItemContent**: Flex-1 wrapper for title and description, occupying the remaining horizontal space.
- **ListGroup.ItemTitle**: Primary text label styled with foreground color and medium font weight.
- **ListGroup.ItemDescription**: Secondary text styled with muted color and smaller font size.
- **ListGroup.ItemSuffix**: Optional trailing content slot. Renders a chevron-right icon by default; accepts children to override the default icon.

## Usage

### Basic Usage

The ListGroup component uses compound parts to create grouped list items with title and description.

```tsx
<ListGroup>
  <ListGroup.Item>
    <ListGroup.ItemContent>
      <ListGroup.ItemTitle>Personal Info</ListGroup.ItemTitle>
      <ListGroup.ItemDescription>
        Name, email, phone number
      </ListGroup.ItemDescription>
    </ListGroup.ItemContent>
    <ListGroup.ItemSuffix />
  </ListGroup.Item>
  <Separator className="mx-4" />
  <ListGroup.Item>
    <ListGroup.ItemContent>
      <ListGroup.ItemTitle>Payment Methods</ListGroup.ItemTitle>
      <ListGroup.ItemDescription>Visa ending in 4829</ListGroup.ItemDescription>
    </ListGroup.ItemContent>
    <ListGroup.ItemSuffix />
  </ListGroup.Item>
</ListGroup>
```

### With Icons

Add leading icons using the `ListGroup.ItemPrefix` slot.

```tsx
<ListGroup>
  <ListGroup.Item>
    <ListGroup.ItemPrefix>
      <Icon name="person-outline" size={22} />
    </ListGroup.ItemPrefix>
    <ListGroup.ItemContent>
      <ListGroup.ItemTitle>Profile</ListGroup.ItemTitle>
      <ListGroup.ItemDescription>Name, photo, bio</ListGroup.ItemDescription>
    </ListGroup.ItemContent>
    <ListGroup.ItemSuffix />
  </ListGroup.Item>
  <Separator className="mx-4" />
  <ListGroup.Item>
    <ListGroup.ItemPrefix>
      <Icon name="lock-closed-outline" size={22} />
    </ListGroup.ItemPrefix>
    <ListGroup.ItemContent>
      <ListGroup.ItemTitle>Security</ListGroup.ItemTitle>
      <ListGroup.ItemDescription>Password, 2FA</ListGroup.ItemDescription>
    </ListGroup.ItemContent>
    <ListGroup.ItemSuffix />
  </ListGroup.Item>
</ListGroup>
```

### Title Only

Omit `ListGroup.ItemDescription` to display title-only items.

```tsx
<ListGroup>
  <ListGroup.Item>
    <ListGroup.ItemPrefix>
      <Icon name="wifi-outline" size={22} />
    </ListGroup.ItemPrefix>
    <ListGroup.ItemContent>
      <ListGroup.ItemTitle>Wi-Fi</ListGroup.ItemTitle>
    </ListGroup.ItemContent>
    <ListGroup.ItemSuffix />
  </ListGroup.Item>
  <Separator className="mx-4" />
  <ListGroup.Item>
    <ListGroup.ItemPrefix>
      <Icon name="bluetooth-outline" size={22} />
    </ListGroup.ItemPrefix>
    <ListGroup.ItemContent>
      <ListGroup.ItemTitle>Bluetooth</ListGroup.ItemTitle>
    </ListGroup.ItemContent>
    <ListGroup.ItemSuffix />
  </ListGroup.Item>
</ListGroup>
```

### Surface Variant

Apply a different visual variant to the root container.

```tsx
<ListGroup variant="transparent">
  <ListGroup.Item>
    <ListGroup.ItemContent>
      <ListGroup.ItemTitle>Wi-Fi</ListGroup.ItemTitle>
    </ListGroup.ItemContent>
    <ListGroup.ItemSuffix />
  </ListGroup.Item>
</ListGroup>
```

### Custom Suffix

Override the default chevron icon by passing children to `ListGroup.ItemSuffix`.

```tsx
<ListGroup>
  <ListGroup.Item>
    <ListGroup.ItemContent>
      <ListGroup.ItemTitle>Language</ListGroup.ItemTitle>
      <ListGroup.ItemDescription>English</ListGroup.ItemDescription>
    </ListGroup.ItemContent>
    <ListGroup.ItemSuffix>
      <Icon name="arrow-forward" size={18} />
    </ListGroup.ItemSuffix>
  </ListGroup.Item>
  <Separator className="mx-4" />
  <ListGroup.Item>
    <ListGroup.ItemContent>
      <ListGroup.ItemTitle>Notifications</ListGroup.ItemTitle>
    </ListGroup.ItemContent>
    <ListGroup.ItemSuffix>
      <Chip variant="primary" color="danger">
        <Chip.Label className="font-bold">7</Chip.Label>
      </Chip>
    </ListGroup.ItemSuffix>
  </ListGroup.Item>
</ListGroup>
```

### Custom Suffix Icon Props

Customise the default chevron icon size and color using `iconProps`.

```tsx
<ListGroup>
  <ListGroup.Item>
    <ListGroup.ItemContent>
      <ListGroup.ItemTitle>Storage</ListGroup.ItemTitle>
      <ListGroup.ItemDescription>
        12.4 GB of 50 GB used
      </ListGroup.ItemDescription>
    </ListGroup.ItemContent>
    <ListGroup.ItemSuffix iconProps={{ size: 18, color: mutedColor }} />
  </ListGroup.Item>
</ListGroup>
```

### With PressableFeedback

Wrap items with `PressableFeedback` to add scale and ripple press feedback animations. When using this pattern, pass `onPress` on `PressableFeedback` instead of `ListGroup.Item` and disable the item with `disabled` prop.

```tsx
import { ListGroup, PressableFeedback, Separator } from "heroui-native";

<ListGroup>
  <PressableFeedback animation={false} onPress={() => {}}>
    <PressableFeedback.Scale>
      <ListGroup.Item disabled>
        <ListGroup.ItemContent>
          <ListGroup.ItemTitle>Appearance</ListGroup.ItemTitle>
          <ListGroup.ItemDescription>
            Theme, font size, display
          </ListGroup.ItemDescription>
        </ListGroup.ItemContent>
        <ListGroup.ItemSuffix />
      </ListGroup.Item>
    </PressableFeedback.Scale>
    <PressableFeedback.Ripple />
  </PressableFeedback>
  <Separator className="mx-4" />
  <PressableFeedback animation={false} onPress={() => {}}>
    <PressableFeedback.Scale>
      <ListGroup.Item disabled>
        <ListGroup.ItemContent>
          <ListGroup.ItemTitle>Notifications</ListGroup.ItemTitle>
          <ListGroup.ItemDescription>
            Alerts, sounds, badges
          </ListGroup.ItemDescription>
        </ListGroup.ItemContent>
        <ListGroup.ItemSuffix />
      </ListGroup.Item>
    </PressableFeedback.Scale>
    <PressableFeedback.Ripple />
  </PressableFeedback>
</ListGroup>;
```

## Example

```tsx
import { Ionicons } from "@expo/vector-icons";
import { ListGroup, Separator, useThemeColor } from "heroui-native";
import { View, Text } from "react-native";
import { withUniwind } from "uniwind";

const StyledIonicons = withUniwind(Ionicons);

export default function ListGroupExample() {
  const mutedColor = useThemeColor("muted");

  return (
    <View className="flex-1 justify-center px-5">
      <Text className="text-sm text-muted mb-2 ml-2">Account</Text>
      <ListGroup className="mb-6">
        <ListGroup.Item>
          <ListGroup.ItemPrefix>
            <StyledIonicons
              name="person-outline"
              size={22}
              className="text-foreground"
            />
          </ListGroup.ItemPrefix>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Personal Info</ListGroup.ItemTitle>
            <ListGroup.ItemDescription>
              Name, email, phone number
            </ListGroup.ItemDescription>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix />
        </ListGroup.Item>
        <Separator className="mx-4" />
        <ListGroup.Item>
          <ListGroup.ItemPrefix>
            <StyledIonicons
              name="card-outline"
              size={22}
              className="text-foreground"
            />
          </ListGroup.ItemPrefix>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Payment Methods</ListGroup.ItemTitle>
            <ListGroup.ItemDescription>
              Visa ending in 4829
            </ListGroup.ItemDescription>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix />
        </ListGroup.Item>
      </ListGroup>
      <Text className="text-sm text-muted mb-2 ml-2">Preferences</Text>
      <ListGroup>
        <ListGroup.Item>
          <ListGroup.ItemPrefix>
            <StyledIonicons
              name="color-palette-outline"
              size={22}
              className="text-foreground"
            />
          </ListGroup.ItemPrefix>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Appearance</ListGroup.ItemTitle>
            <ListGroup.ItemDescription>
              Theme, font size, display
            </ListGroup.ItemDescription>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix />
        </ListGroup.Item>
        <Separator className="mx-4" />
        <ListGroup.Item>
          <ListGroup.ItemPrefix>
            <StyledIonicons
              name="notifications-outline"
              size={22}
              className="text-foreground"
            />
          </ListGroup.ItemPrefix>
          <ListGroup.ItemContent>
            <ListGroup.ItemTitle>Notifications</ListGroup.ItemTitle>
            <ListGroup.ItemDescription>
              Alerts, sounds, badges
            </ListGroup.ItemDescription>
          </ListGroup.ItemContent>
          <ListGroup.ItemSuffix iconProps={{ size: 18, color: mutedColor }} />
        </ListGroup.Item>
      </ListGroup>
    </View>
  );
}
```

You can find more examples in the [GitHub repository](<https://github.com/heroui-inc/heroui-native/blob/main/example/src/app/(home)/components/list-group.tsx>).

## API Reference

### ListGroup

| prop           | type                                                      | default     | description                                        |
| -------------- | --------------------------------------------------------- | ----------- | -------------------------------------------------- |
| `children`     | `React.ReactNode`                                         | -           | Children elements to be rendered inside the group  |
| `variant`      | `'default' \| 'secondary' \| 'tertiary' \| 'transparent'` | `'default'` | Visual variant of the underlying Surface container |
| `className`    | `string`                                                  | -           | Additional CSS classes for the root container      |
| `...ViewProps` | `ViewProps`                                               | -           | All standard React Native View props are supported |

### ListGroup.Item

| prop                | type              | default | description                                             |
| ------------------- | ----------------- | ------- | ------------------------------------------------------- |
| `children`          | `React.ReactNode` | -       | Children elements to be rendered inside the item        |
| `className`         | `string`          | -       | Additional CSS classes for the item                     |
| `...PressableProps` | `PressableProps`  | -       | All standard React Native Pressable props are supported |

### ListGroup.ItemPrefix

| prop           | type              | default | description                                        |
| -------------- | ----------------- | ------- | -------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Leading content such as icons or avatars           |
| `className`    | `string`          | -       | Additional CSS classes for the prefix              |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported |

### ListGroup.ItemContent

| prop           | type              | default | description                                        |
| -------------- | ----------------- | ------- | -------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Content area, typically title and description      |
| `className`    | `string`          | -       | Additional CSS classes for the content area        |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported |

### ListGroup.ItemTitle

| prop           | type              | default | description                                        |
| -------------- | ----------------- | ------- | -------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Title text or custom content                       |
| `className`    | `string`          | -       | Additional CSS classes for the title               |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported |

### ListGroup.ItemDescription

| prop           | type              | default | description                                        |
| -------------- | ----------------- | ------- | -------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Description text or custom content                 |
| `className`    | `string`          | -       | Additional CSS classes for the description         |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported |

### ListGroup.ItemSuffix

| prop           | type                 | default | description                                                                      |
| -------------- | -------------------- | ------- | -------------------------------------------------------------------------------- |
| `children`     | `React.ReactNode`    | -       | Custom trailing content; overrides the default chevron-right icon when provided  |
| `className`    | `string`             | -       | Additional CSS classes for the suffix                                            |
| `iconProps`    | `ListGroupIconProps` | -       | Props to customise the default chevron-right icon. Only applies when no children |
| `...ViewProps` | `ViewProps`          | -       | All standard React Native View props are supported                               |

#### ListGroupIconProps

| prop    | type     | default             | description                        |
| ------- | -------- | ------------------- | ---------------------------------- |
| `size`  | `number` | `16`                | Size of the chevron icon in pixels |
| `color` | `string` | theme `muted` color | Color of the chevron icon          |

</page>

<page url="/en/docs/native/components/search-field">
# SearchField

**Category**: native
**URL**: https://www.heroui.com/en/docs/native/components/search-field
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/en/native/components/(forms)/search-field.mdx

> A compound search input for filtering and querying content.

---

<NativeVideoPlayerView
  target="auto"
  srcLight="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/search-field-docs-light.mp4"
  srcDark="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/search-field-docs-dark.mp4"
/>

## Import

```tsx
import { SearchField } from "heroui-native";
```

## Anatomy

```tsx
<SearchField value={value} onChange={onChange}>
  <SearchField.Group>
    <SearchField.SearchIcon />
    <SearchField.Input />
    <SearchField.ClearButton />
  </SearchField.Group>
</SearchField>
```

- **SearchField**: Root container that accepts `value` and `onChange`, providing them to children via context. Also provides form field state (isDisabled, isInvalid, isRequired) and animation settings.
- **SearchField.Group**: Flex-row container that positions the search icon, input, and clear button horizontally.
- **SearchField.SearchIcon**: Magnifying glass icon positioned absolutely on the left side of the input. Supports custom children to replace the default icon.
- **SearchField.Input**: Wraps the Input component with search-specific defaults. Reads `value` and `onChangeText` from the SearchField context automatically.
- **SearchField.ClearButton**: Small icon-only button to clear the search input. Automatically hidden when value is empty. Calls `onChange("")` from context on press.

## Usage

### Basic Usage

The SearchField component uses compound parts to create a search input. Pass `value` and `onChange` to the root; the Input and ClearButton consume them via context.

```tsx
<SearchField value={searchValue} onChange={setSearchValue}>
  <SearchField.Group>
    <SearchField.SearchIcon />
    <SearchField.Input />
    <SearchField.ClearButton />
  </SearchField.Group>
</SearchField>
```

### With Label and Description

Add a Label and Description outside the Group to provide context for the search field.

```tsx
<SearchField value={searchValue} onChange={setSearchValue}>
  <Label>Find products</Label>
  <SearchField.Group>
    <SearchField.SearchIcon />
    <SearchField.Input />
    <SearchField.ClearButton />
  </SearchField.Group>
  <Description>Search by name, category, or SKU</Description>
</SearchField>
```

### With Validation

Use `isInvalid` and `isRequired` on the root to control validation state. Pair with FieldError to display error messages.

```tsx
<SearchField
  value={searchValue}
  onChange={setSearchValue}
  isRequired
  isInvalid={isInvalid}
>
  <Label>Search users</Label>
  <SearchField.Group>
    <SearchField.SearchIcon />
    <SearchField.Input />
    <SearchField.ClearButton />
  </SearchField.Group>
  <Description hideOnInvalid>Enter at least 3 characters to search</Description>
  <FieldError>No results found. Please try a different search term.</FieldError>
</SearchField>
```

### Custom Search Icon

Replace the default magnifying glass icon by passing children to `SearchField.SearchIcon`.

```tsx
<SearchField value={searchValue} onChange={setSearchValue}>
  <SearchField.Group>
    <SearchField.SearchIcon>
      <Text className="text-base">🔍</Text>
    </SearchField.SearchIcon>
    <SearchField.Input className="pl-10" />
    <SearchField.ClearButton />
  </SearchField.Group>
</SearchField>
```

### Disabled

Set `isDisabled` on the root to disable all child components via context.

```tsx
<SearchField value="Previous query" isDisabled>
  <Label>Disabled search</Label>
  <SearchField.Group>
    <SearchField.SearchIcon />
    <SearchField.Input />
  </SearchField.Group>
  <Description>Search is temporarily unavailable</Description>
</SearchField>
```

## Example

```tsx
import { Description, Label, SearchField } from "heroui-native";
import { useState } from "react";
import { View } from "react-native";

export default function SearchFieldExample() {
  const [searchValue, setSearchValue] = useState("");

  return (
    <View className="px-5">
      <SearchField value={searchValue} onChange={setSearchValue}>
        <Label>Find products</Label>
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input />
          <SearchField.ClearButton />
        </SearchField.Group>
        <Description>Search by name, category, or SKU</Description>
      </SearchField>
    </View>
  );
}
```

You can find more examples in the [GitHub repository](<https://github.com/heroui-inc/heroui-native/blob/main/example/src/app/(home)/components/search-field.tsx>).

## API Reference

### SearchField

| prop           | type                      | default | description                                              |
| -------------- | ------------------------- | ------- | -------------------------------------------------------- |
| `children`     | `React.ReactNode`         | -       | Children elements to be rendered inside the search field |
| `value`        | `string`                  | -       | Controlled search text value                             |
| `onChange`     | `(value: string) => void` | -       | Callback fired when the search text changes              |
| `isDisabled`   | `boolean`                 | `false` | Whether the search field is disabled                     |
| `isInvalid`    | `boolean`                 | `false` | Whether the search field is in an invalid state          |
| `isRequired`   | `boolean`                 | `false` | Whether the search field is required                     |
| `className`    | `string`                  | -       | Additional CSS classes                                   |
| `animation`    | `AnimationRootDisableAll` | -       | Animation configuration for the search field             |
| `...ViewProps` | `ViewProps`               | -       | All standard React Native View props are supported       |

#### AnimationRootDisableAll

Animation configuration for the SearchField root component. Can be:

- `"disable-all"`: Disable all animations including children (cascades down)
- `undefined`: Use default animations

### SearchField.Group

| prop           | type              | default | description                                        |
| -------------- | ----------------- | ------- | -------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Children elements to be rendered inside the group  |
| `className`    | `string`          | -       | Additional CSS classes                             |
| `...ViewProps` | `ViewProps`       | -       | All standard React Native View props are supported |

### SearchField.SearchIcon

| prop           | type                             | default | description                                                                        |
| -------------- | -------------------------------- | ------- | ---------------------------------------------------------------------------------- |
| `children`     | `React.ReactNode`                | -       | Custom content to replace the default search icon                                  |
| `className`    | `string`                         | -       | Additional CSS classes                                                             |
| `iconProps`    | `SearchFieldSearchIconIconProps` | -       | Props for customizing the default search icon (ignored when children are provided) |
| `...ViewProps` | `ViewProps`                      | -       | All standard React Native View props are supported                                 |

#### SearchFieldSearchIconIconProps

| prop    | type     | default             | description       |
| ------- | -------- | ------------------- | ----------------- |
| `size`  | `number` | `16`                | Size of the icon  |
| `color` | `string` | Theme `muted` color | Color of the icon |

### SearchField.Input

Extends [Input](./input) props with search-specific defaults (`placeholder="Search..."`, `returnKeyType="search"`, `accessibilityRole="search"`). Omits `value` and `onChangeText` because they are provided by the SearchField context.

### SearchField.ClearButton

Automatically hidden when the controlled `value` is an empty string. Calls `onChange("")` from context on press. Additional `onPress` handlers passed via props are called after clearing.

| prop             | type                              | default | description                                      |
| ---------------- | --------------------------------- | ------- | ------------------------------------------------ |
| `children`       | `React.ReactNode`                 | -       | Custom content to replace the default close icon |
| `iconProps`      | `SearchFieldClearButtonIconProps` | -       | Props for customizing the clear button icon      |
| `className`      | `string`                          | -       | Additional CSS classes                           |
| `...ButtonProps` | `ButtonRootProps`                 | -       | All Button root props are supported              |

#### SearchFieldClearButtonIconProps

| prop    | type     | default             | description       |
| ------- | -------- | ------------------- | ----------------- |
| `size`  | `number` | `14`                | Size of the icon  |
| `color` | `string` | Theme `muted` color | Color of the icon |

## Hooks

### useSearchField

Hook to access the search field state from context. Must be used within a `SearchField` component.

```tsx
import { useSearchField } from "heroui-native";

const { value, onChange, isDisabled, isInvalid, isRequired } = useSearchField();
```

#### Returns

| property     | type                                     | description                                     |
| ------------ | ---------------------------------------- | ----------------------------------------------- |
| `value`      | `string \| undefined`                    | Current controlled search text value            |
| `onChange`   | `((value: string) => void) \| undefined` | Callback to update the search text              |
| `isDisabled` | `boolean`                                | Whether the search field is disabled            |
| `isInvalid`  | `boolean`                                | Whether the search field is in an invalid state |
| `isRequired` | `boolean`                                | Whether the search field is required            |

</page>

<page url="/en/docs/native/components/separator">
# Separator

**Category**: native
**URL**: https://www.heroui.com/en/docs/native/components/separator
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/en/native/components/(layout)/separator.mdx

> A simple line to separate content visually.

---

<NativeVideoPlayerView
  target="auto"
  srcLight="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/separator-docs-light.mp4"
  srcDark="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/separator-docs-dark.mp4"
/>

## Import

```tsx
import { Separator } from "heroui-native";
```

## Anatomy

```tsx
<Separator />
```

- **Separator**: A simple line component that separates content visually. Can be oriented horizontally or vertically, with customizable thickness and variant styles.

## Usage

### Basic Usage

The Separator component creates a visual separation between content sections.

```tsx
<Separator />
```

### Orientation

Control the direction of the separator with the `orientation` prop.

```tsx
<View>
  <Text>Horizontal separator</Text>
  <Separator orientation="horizontal" />
  <Text>Content below</Text>
</View>

<View className="h-24 flex-row">
  <Text>Left</Text>
  <Separator orientation="vertical" />
  <Text>Right</Text>
</View>

```

### Variants

Choose between thin and thick variants for different visual emphasis.

```tsx
<Separator variant="thin" />
<Separator variant="thick" />

```

### Custom Thickness

Set a specific thickness value for precise control.

```tsx
<Separator thickness={1} />
<Separator thickness={5} />
<Separator thickness={10} />

```

## Example

```tsx
import { Separator, Surface } from "heroui-native";
import { Text, View } from "react-native";

export default function SeparatorExample() {
  return (
    <Surface variant="secondary" className="px-6 py-7">
      <Text className="text-base font-medium text-foreground">
        HeroUI Native
      </Text>
      <Text className="text-sm text-muted">
        A modern React Native component library.
      </Text>
      <Separator className="my-4" />
      <View className="flex-row items-center h-5">
        <Text className="text-sm text-foreground">Components</Text>
        <Separator orientation="vertical" className="mx-3" />
        <Text className="text-sm text-foreground">Themes</Text>
        <Separator orientation="vertical" className="mx-3" />
        <Text className="text-sm text-foreground">Examples</Text>
      </View>
    </Surface>
  );
}
```

You can find more examples in the [GitHub repository](<https://github.com/heroui-inc/heroui-native/blob/main/example/src/app/(home)/components/separator.tsx>).

## API Reference

### Separator

| prop           | type                         | default        | description                                                                                  |
| -------------- | ---------------------------- | -------------- | -------------------------------------------------------------------------------------------- |
| `variant`      | `'thin' \| 'thick'`          | `'thin'`       | Variant style of the separator                                                               |
| `orientation`  | `'horizontal' \| 'vertical'` | `'horizontal'` | Orientation of the separator                                                                 |
| `thickness`    | `number`                     | `undefined`    | Custom thickness in pixels. Controls height for horizontal or width for vertical orientation |
| `className`    | `string`                     | `undefined`    | Additional CSS classes to apply                                                              |
| `...ViewProps` | `ViewProps`                  | -              | All standard React Native View props are supported                                           |

</page>

<page url="/en/docs/native/components/skeleton">
# Skeleton

**Category**: native
**URL**: https://www.heroui.com/en/docs/native/components/skeleton
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/en/native/components/(feedback)/skeleton.mdx

> Displays a loading placeholder with shimmer or pulse animation effects.

---

<NativeVideoPlayerView
  target="auto"
  srcLight="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/skeleton-docs-light.mp4"
  srcDark="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/skeleton-docs-dark.mp4"
/>

## Import

```tsx
import { Skeleton } from "heroui-native";
```

## Anatomy

The Skeleton component is a simple wrapper that renders a placeholder for content that is loading. It does not have any child components.

```tsx
<Skeleton />
```

## Usage

### Basic Usage

The Skeleton component creates an animated placeholder while content is loading.

```tsx
<Skeleton className="h-20 w-full rounded-lg" />
```

### With Content

Show skeleton while loading, then display content when ready.

```tsx
<Skeleton isLoading={isLoading} className="h-20 rounded-lg">
  <View className="h-20 bg-primary rounded-lg">
    <Text>Loaded Content</Text>
  </View>
</Skeleton>
```

### Animation Variants

Control the animation style with the `variant` prop.

```tsx
<Skeleton variant="shimmer" className="h-20 w-full rounded-lg" />
<Skeleton variant="pulse" className="h-20 w-full rounded-lg" />
<Skeleton variant="none" className="h-20 w-full rounded-lg" />

```

### Custom Shimmer Configuration

Customize the shimmer effect with duration, speed, and highlight color.

```tsx
<Skeleton
  className="h-16 w-full rounded-lg"
  variant="shimmer"
  animation={{
    shimmer: {
      duration: 2000,
      speed: 2,
      highlightColor: "rgba(59, 130, 246, 0.3)",
    },
  }}
>
  ...
</Skeleton>
```

### Custom Pulse Configuration

Configure pulse animation with duration and opacity range.

```tsx
<Skeleton
  className="h-16 w-full rounded-lg"
  variant="pulse"
  animation={{
    pulse: {
      duration: 500,
      minOpacity: 0.1,
      maxOpacity: 0.8,
    },
  }}
>
  ...
</Skeleton>
```

### Shape Variations

Create different skeleton shapes using className for styling.

```tsx
<Skeleton className="h-4 w-full rounded-md" />
<Skeleton className="h-4 w-3/4 rounded-md" />
<Skeleton className="h-4 w-1/2 rounded-md" />
<Skeleton className="size-12 rounded-full" />

```

### Custom Enter/Exit Animations

Apply custom Reanimated transitions when skeleton appears or disappears.

```tsx
<Skeleton
  entering={FadeIn.duration(300)}
  exiting={FadeOut.duration(300)}
  isLoading={isLoading}
  className="h-20 w-full rounded-lg"
>
  ...
</Skeleton>
```

## Example

```tsx
import { Avatar, Card, Skeleton } from "heroui-native";
import { useState } from "react";
import { Image, Text, View } from "react-native";

export default function SkeletonExample() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Card className="p-4">
      <View className="flex-row items-center gap-3 mb-4">
        <Skeleton isLoading={isLoading} className="h-10 w-10 rounded-full">
          <Avatar size="sm" alt="Avatar">
            <Avatar.Image source={{ uri: "https://i.pravatar.cc/150?img=4" }} />
            <Avatar.Fallback />
          </Avatar>
        </Skeleton>

        <View className="flex-1 gap-1">
          <Skeleton isLoading={isLoading} className="h-3 w-32 rounded-md">
            <Text className="font-semibold text-foreground">John Doe</Text>
          </Skeleton>
          <Skeleton isLoading={isLoading} className="h-3 w-24 rounded-md">
            <Text className="text-sm text-muted">@johndoe</Text>
          </Skeleton>
        </View>
      </View>

      <Skeleton
        isLoading={isLoading}
        className="h-48 w-full rounded-lg"
        animation={{
          shimmer: {
            duration: 1500,
            speed: 1,
          },
        }}
      >
        <View className="h-48 bg-surface-tertiary rounded-lg overflow-hidden">
          <Image
            source={{
              uri: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/backgrounds/cards/car1.jpg",
            }}
            className="h-full w-full"
          />
        </View>
      </Skeleton>
    </Card>
  );
}
```

You can find more examples in the [GitHub repository](<https://github.com/heroui-inc/heroui-native/blob/main/example/src/app/(home)/components/skeleton.tsx>).

## API Reference

### Skeleton

| prop                    | type                             | default     | description                                                  |
| ----------------------- | -------------------------------- | ----------- | ------------------------------------------------------------ |
| `children`              | `React.ReactNode`                | -           | Content to show when not loading                             |
| `isLoading`             | `boolean`                        | `true`      | Whether the skeleton is currently loading                    |
| `variant`               | `'shimmer' \| 'pulse' \| 'none'` | `'shimmer'` | Animation variant                                            |
| `animation`             | `SkeletonRootAnimation`          | -           | Animation configuration                                      |
| `isAnimatedStyleActive` | `boolean`                        | `true`      | Whether animated styles (react-native-reanimated) are active |
| `className`             | `string`                         | -           | Additional CSS classes for styling                           |
| `...Animated.ViewProps` | `AnimatedProps<ViewProps>`       | -           | All Reanimated Animated.View props are supported             |

#### SkeletonRootAnimation

Animation configuration for Skeleton component. Can be:

- `false` or `"disabled"`: Disable only root animations
- `"disable-all"`: Disable all animations including children
- `true` or `undefined`: Use default animations
- `object`: Custom animation configuration

| prop                     | type                                     | default                     | description                                     |
| ------------------------ | ---------------------------------------- | --------------------------- | ----------------------------------------------- |
| `state`                  | `'disabled' \| 'disable-all' \| boolean` | -                           | Disable animations while customizing properties |
| `entering.value`         | `EntryOrExitLayoutType`                  | `FadeIn`                    | Custom entering animation                       |
| `exiting.value`          | `EntryOrExitLayoutType`                  | `FadeOut`                   | Custom exiting animation                        |
| `shimmer.duration`       | `number`                                 | `1500`                      | Animation duration in milliseconds              |
| `shimmer.speed`          | `number`                                 | `1`                         | Speed multiplier for the animation              |
| `shimmer.highlightColor` | `string`                                 | -                           | Highlight color for the shimmer effect          |
| `shimmer.easing`         | `EasingFunction`                         | `Easing.linear`             | Easing function for the animation               |
| `pulse.duration`         | `number`                                 | `1000`                      | Animation duration in milliseconds              |
| `pulse.minOpacity`       | `number`                                 | `0.5`                       | Minimum opacity value                           |
| `pulse.maxOpacity`       | `number`                                 | `1`                         | Maximum opacity value                           |
| `pulse.easing`           | `EasingFunction`                         | `Easing.inOut(Easing.ease)` | Easing function for the animation               |

</page>

<page url="/en/docs/native/components/spinner">
# Spinner

**Category**: native
**URL**: https://www.heroui.com/en/docs/native/components/spinner
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/en/native/components/(feedback)/spinner.mdx

> Displays an animated loading indicator.

---

<NativeVideoPlayerView
  target="auto"
  srcLight="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/spinner-docs-light.mp4"
  srcDark="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/spinner-docs-dark.mp4"
/>

## Import

```tsx
import { Spinner } from "heroui-native";
```

## Anatomy

```tsx
<Spinner>
  <Spinner.Indicator>...</Spinner.Indicator>
</Spinner>
```

- **Spinner**: Main container that controls loading state, size, and color. Renders a default animated indicator if no children provided.
- **Spinner.Indicator**: Optional sub-component for customizing animation configuration and icon appearance. Accepts custom children to replace the default icon.

## Usage

### Basic Usage

The Spinner component displays a rotating loading indicator.

```tsx
<Spinner />
```

### Sizes

Control the spinner size with the `size` prop.

```tsx
<Spinner size="sm" />
<Spinner size="md" />
<Spinner size="lg" />

```

### Colors

Use predefined color variants or custom colors.

```tsx
<Spinner color="default" />
<Spinner color="success" />
<Spinner color="warning" />
<Spinner color="danger" />
<Spinner color="#8B5CF6" />

```

### Loading State

Control the visibility of the spinner with the `isLoading` prop.

```tsx
<Spinner isLoading={true} />
<Spinner isLoading={false} />

```

### Animation Speed

Customize the rotation speed using the `animation` prop on the Indicator component.

```tsx
<Spinner>
  <Spinner.Indicator animation={{ rotation: { speed: 0.5 } }} />
</Spinner>

<Spinner>
  <Spinner.Indicator animation={{ rotation: { speed: 2 } }} />
</Spinner>

```

### Custom Icon

Replace the default spinner icon with custom content.

```tsx
const themeColorForeground = useThemeColor('foreground')

<Spinner>
  <Spinner.Indicator>
    <Ionicons name="refresh" size={24} color={themeColorForeground} />
  </Spinner.Indicator>
</Spinner>

<Spinner>
  <Spinner.Indicator>
    <Text>⏳</Text>
  </Spinner.Indicator>
</Spinner>

```

## Example

```tsx
import { Spinner } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function SpinnerExample() {
  const [isLoading, setIsLoading] = React.useState(true);

  return (
    <View className="gap-4 p-4 bg-background">
      <View className="flex-row items-center gap-2 p-4 rounded-lg bg-stone-200">
        <Spinner size="sm" color="default" />
        <Text className="text-stone-500">Loading content...</Text>
      </View>

      <View className="items-center p-8 rounded-2xl bg-stone-200">
        <Spinner size="lg" color="success" isLoading={isLoading} />
        <Text className="text-stone-500 mt-4">Processing...</Text>
        <TouchableOpacity onPress={() => setIsLoading(!isLoading)}>
          <Text className="text-primary mt-2 text-sm">
            {isLoading ? "Tap to stop" : "Tap to start"}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-4 items-center justify-center">
        <Spinner size="md" color="#EC4899">
          <Spinner.Indicator animation={{ rotation: { speed: 0.7 } }}>
            <Ionicons name="refresh" size={24} color="#EC4899" />
          </Spinner.Indicator>
        </Spinner>
      </View>
    </View>
  );
}
```

You can find more examples in the [GitHub repository](<https://github.com/heroui-inc/heroui-native/blob/main/example/src/app/(home)/components/spinner.tsx>).

## API Reference

### Spinner

| prop           | type                                                        | default     | description                                        |
| -------------- | ----------------------------------------------------------- | ----------- | -------------------------------------------------- |
| `children`     | `React.ReactNode`                                           | `undefined` | Content to render inside the spinner               |
| `size`         | `'sm' \| 'md' \| 'lg'`                                      | `'md'`      | Size of the spinner                                |
| `color`        | `'default' \| 'success' \| 'warning' \| 'danger' \| string` | `'default'` | Color theme of the spinner                         |
| `isLoading`    | `boolean`                                                   | `true`      | Whether the spinner is loading                     |
| `className`    | `string`                                                    | `undefined` | Custom class name for the spinner                  |
| `animation`    | `SpinnerRootAnimation`                                      | -           | Animation configuration                            |
| `...ViewProps` | `ViewProps`                                                 | -           | All standard React Native View props are supported |

#### SpinnerRootAnimation

Animation configuration for Spinner component. Can be:

- `false` or `"disabled"`: Disable only root animations
- `"disable-all"`: Disable all animations including children
- `true` or `undefined`: Use default animations
- `object`: Custom animation configuration

| prop             | type                                     | default                                                              | description                                     |
| ---------------- | ---------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------- |
| `state`          | `'disabled' \| 'disable-all' \| boolean` | -                                                                    | Disable animations while customizing properties |
| `entering.value` | `EntryOrExitLayoutType`                  | `FadeIn`<br/>`.duration(200)`<br/>`.easing(Easing.out(Easing.ease))` | Custom entering animation                       |
| `exiting.value`  | `EntryOrExitLayoutType`                  | `FadeOut`<br/>`.duration(100)`                                       | Custom exiting animation                        |

### Spinner.Indicator

| prop                    | type                        | default     | description                                                  |
| ----------------------- | --------------------------- | ----------- | ------------------------------------------------------------ |
| `children`              | `React.ReactNode`           | `undefined` | Content to render inside the indicator                       |
| `iconProps`             | `SpinnerIconProps`          | `undefined` | Props for the default icon                                   |
| `className`             | `string`                    | `undefined` | Custom class name for the indicator element                  |
| `animation`             | `SpinnerIndicatorAnimation` | -           | Animation configuration                                      |
| `isAnimatedStyleActive` | `boolean`                   | `true`      | Whether animated styles (react-native-reanimated) are active |
| `...Animated.ViewProps` | `Animated.ViewProps`        | -           | All Reanimated Animated.View props are supported             |

#### SpinnerIndicatorAnimation

Animation configuration for Spinner.Indicator component. Can be:

- `false` or `"disabled"`: Disable all animations
- `true` or `undefined`: Use default animations
- `object`: Custom animation configuration

| prop              | type                         | default         | description                                     |
| ----------------- | ---------------------------- | --------------- | ----------------------------------------------- |
| `state`           | `'disabled' \| boolean`      | -               | Disable animations while customizing properties |
| `rotation.speed`  | `number`                     | `1.1`           | Rotation speed multiplier                       |
| `rotation.easing` | `WithTimingConfig['easing']` | `Easing.linear` | Animation easing configuration                  |

### SpinnerIconProps

| prop     | type               | default          | description        |
| -------- | ------------------ | ---------------- | ------------------ |
| `width`  | `number \| string` | `24`             | Width of the icon  |
| `height` | `number \| string` | `24`             | Height of the icon |
| `color`  | `string`           | `'currentColor'` | Color of the icon  |

</page>

<page url="/en/docs/native/components/switch">
# Switch

**Category**: native
**URL**: https://www.heroui.com/en/docs/native/components/switch
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/en/native/components/(controls)/switch.mdx

> A toggle control that allows users to switch between on and off states.

---

<NativeVideoPlayerView
  target="auto"
  srcLight="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/switch-docs-light.mp4"
  srcDark="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/switch-docs-dark.mp4"
/>

## Import

```tsx
import { Switch } from "heroui-native";
```

## Anatomy

```tsx
<Switch>
  <Switch.Thumb>...</Switch.Thumb>
  <Switch.StartContent>...</Switch.StartContent>
  <Switch.EndContent>...</Switch.EndContent>
</Switch>
```

- **Switch**: Main container that handles toggle state and user interaction. Renders default thumb if no children provided. Animates scale (on press) and background color based on selection state. Acts as a pressable area for toggling.
- **Switch.Thumb**: Optional sliding thumb element that moves between positions. Uses spring animation for smooth transitions. Can contain custom content like icons or be customized with different styles and animations.
- **Switch.StartContent**: Optional content displayed on the left side of the switch. Typically used for icons or text that appear when switch is off. Positioned absolutely within the switch container.
- **Switch.EndContent**: Optional content displayed on the right side of the switch. Typically used for icons or text that appear when switch is on. Positioned absolutely within the switch container.

## Usage

### Basic Usage

The Switch component renders with default thumb if no children provided.

```tsx
<Switch isSelected={isSelected} onSelectedChange={setIsSelected} />
```

### With Custom Thumb

Replace the default thumb with custom content using the Thumb component.

```tsx
<Switch isSelected={isSelected} onSelectedChange={setIsSelected}>
  <Switch.Thumb>...</Switch.Thumb>
</Switch>
```

### With Start and End Content

Add icons or text that appear on each side of the switch.

```tsx
<Switch isSelected={isSelected} onSelectedChange={setIsSelected}>
  <Switch.Thumb />
  <Switch.StartContent>...</Switch.StartContent>
  <Switch.EndContent>...</Switch.EndContent>
</Switch>
```

### With Render Function

Use render functions for dynamic content based on switch state.

```tsx
<Switch isSelected={isSelected} onSelectedChange={setIsSelected}>
  {({ isSelected, isDisabled }) => (
    <>
      <Switch.Thumb>
        {({ isSelected }) => (isSelected ? <CheckIcon /> : <XIcon />)}
      </Switch.Thumb>
    </>
  )}
</Switch>
```

### With Custom Animations

Customize animations for the switch root and thumb components.

```tsx
<Switch
  animation={{
    scale: {
      value: [1, 0.9],
      timingConfig: { duration: 200 },
    },
    backgroundColor: {
      value: ["#172554", "#eab308"],
    },
  }}
>
  <Switch.Thumb
    animation={{
      left: {
        value: 4,
        springConfig: {
          damping: 30,
          stiffness: 300,
          mass: 1,
        },
      },
      backgroundColor: {
        value: ["#dbeafe", "#854d0e"],
      },
    }}
  />
</Switch>
```

### Disable Animations

Disable animations entirely or only for specific components.

```tsx
{
  /* Disable all animations including children */
}
<Switch animation="disable-all">
  <Switch.Thumb />
</Switch>;

{
  /* Disable only root animations, thumb can still animate */
}
<Switch>
  <Switch.Thumb animation={false} />
</Switch>;
```

## Example

```tsx
import { Switch } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";

export default function SwitchExample() {
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <View className="flex-row gap-4">
      <Switch
        isSelected={darkMode}
        onSelectedChange={setDarkMode}
        className="w-[56px] h-[32px]"
        animation={{
          backgroundColor: {
            value: ["#172554", "#eab308"],
          },
        }}
      >
        <Switch.Thumb
          className="size-[22px]"
          animation={{
            left: {
              value: 4,
              springConfig: {
                damping: 30,
                stiffness: 300,
                mass: 1,
              },
            },
          }}
        />
        <Switch.StartContent className="left-2">
          {darkMode && (
            <Animated.View key="sun" entering={ZoomIn.springify()}>
              <Ionicons name="sunny" size={16} color="#854d0e" />
            </Animated.View>
          )}
        </Switch.StartContent>
        <Switch.EndContent className="right-2">
          {!darkMode && (
            <Animated.View key="moon" entering={ZoomIn.springify()}>
              <Ionicons name="moon" size={16} color="#dbeafe" />
            </Animated.View>
          )}
        </Switch.EndContent>
      </Switch>
    </View>
  );
}
```

You can find more examples in the [GitHub repository](<https://github.com/heroui-inc/heroui-native/blob/main/example/src/app/(home)/components/switch.tsx>).

## API Reference

### Switch

| prop                        | type                                                                 | default     | description                                                  |
| --------------------------- | -------------------------------------------------------------------- | ----------- | ------------------------------------------------------------ |
| `children`                  | `React.ReactNode \| ((props: SwitchRenderProps) => React.ReactNode)` | `undefined` | Content to render inside the switch, or a render function    |
| `isSelected`                | `boolean`                                                            | `undefined` | Whether the switch is currently selected                     |
| `isDisabled`                | `boolean`                                                            | `false`     | Whether the switch is disabled and cannot be interacted with |
| `className`                 | `string`                                                             | `undefined` | Custom class name for the switch                             |
| `animation`                 | `SwitchRootAnimation`                                                | -           | Animation configuration                                      |
| `isAnimatedStyleActive`     | `boolean`                                                            | `true`      | Whether animated styles (react-native-reanimated) are active |
| `onSelectedChange`          | `(isSelected: boolean) => void`                                      | -           | Callback fired when the switch selection state changes       |
| `...AnimatedPressableProps` | `AnimatedProps<PressableProps>`                                      | -           | All React Native Reanimated Pressable props are supported    |

#### SwitchRenderProps

| prop         | type      | description                    |
| ------------ | --------- | ------------------------------ |
| `isSelected` | `boolean` | Whether the switch is selected |
| `isDisabled` | `boolean` | Whether the switch is disabled |

#### SwitchRootAnimation

Animation configuration for Switch component. Can be:

- `false` or `"disabled"`: Disable only root animations
- `"disable-all"`: Disable all animations including children
- `true` or `undefined`: Use default animations
- `object`: Custom animation configuration

| prop                           | type                                     | default                                                        | description                                     |
| ------------------------------ | ---------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------- |
| `state`                        | `'disabled' \| 'disable-all' \| boolean` | -                                                              | Disable animations while customizing properties |
| `scale.value`                  | `[number, number]`                       | `[1, 0.96]`                                                    | Scale values [unpressed, pressed]               |
| `scale.timingConfig`           | `WithTimingConfig`                       | `{ duration: 150 }`                                            | Animation timing configuration                  |
| `backgroundColor.value`        | `[string, string]`                       | Uses theme colors                                              | Background color values [unselected, selected]  |
| `backgroundColor.timingConfig` | `WithTimingConfig`                       | `{ duration: 175, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }` | Animation timing configuration                  |

### Switch.Thumb

| prop                    | type                                                                 | default     | description                                                  |
| ----------------------- | -------------------------------------------------------------------- | ----------- | ------------------------------------------------------------ |
| `children`              | `React.ReactNode \| ((props: SwitchRenderProps) => React.ReactNode)` | `undefined` | Content to render inside the thumb, or a render function     |
| `className`             | `string`                                                             | `undefined` | Custom class name for the thumb element                      |
| `animation`             | `SwitchThumbAnimation`                                               | -           | Animation configuration                                      |
| `isAnimatedStyleActive` | `boolean`                                                            | `true`      | Whether animated styles (react-native-reanimated) are active |
| `...ViewProps`          | `ViewProps`                                                          | -           | All standard React Native View props are supported           |

#### SwitchThumbAnimation

Animation configuration for Switch.Thumb component. Can be:

- `false` or `"disabled"`: Disable all animations
- `true` or `undefined`: Use default animations
- `object`: Custom animation configuration

| prop                           | type                    | default                                                        | description                                                             |
| ------------------------------ | ----------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `state`                        | `'disabled' \| boolean` | -                                                              | Disable animations while customizing properties                         |
| `left.value`                   | `number`                | `2`                                                            | Offset value from the edges (left when unselected, right when selected) |
| `left.springConfig`            | `WithSpringConfig`      | `{ damping: 120, stiffness: 1600, mass: 2 }`                   | Spring animation configuration for thumb position                       |
| `backgroundColor.value`        | `[string, string]`      | `['white', theme accent-foreground color]`                     | Background color values [unselected, selected]                          |
| `backgroundColor.timingConfig` | `WithTimingConfig`      | `{ duration: 175, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }` | Animation timing configuration                                          |

### Switch.StartContent

| prop           | type              | default     | description                                        |
| -------------- | ----------------- | ----------- | -------------------------------------------------- |
| `children`     | `React.ReactNode` | `undefined` | Content to render inside the switch content        |
| `className`    | `string`          | `undefined` | Custom class name for the content element          |
| `...ViewProps` | `ViewProps`       | -           | All standard React Native View props are supported |

### Switch.EndContent

| prop           | type              | default     | description                                        |
| -------------- | ----------------- | ----------- | -------------------------------------------------- |
| `children`     | `React.ReactNode` | `undefined` | Content to render inside the switch content        |
| `className`    | `string`          | `undefined` | Custom class name for the content element          |
| `...ViewProps` | `ViewProps`       | -           | All standard React Native View props are supported |

## Hooks

### useSwitch

A hook that provides access to the Switch context. This is useful when building custom switch components or when you need to access switch state in child components.

**Returns:**

| Property     | Type      | Description                    |
| ------------ | --------- | ------------------------------ |
| `isSelected` | `boolean` | Whether the switch is selected |
| `isDisabled` | `boolean` | Whether the switch is disabled |

**Example:**

```tsx
import { useSwitch } from "heroui-native";

function CustomSwitchContent() {
  const { isSelected, isDisabled } = useSwitch();

  return (
    <View>
      <Text>Status: {isSelected ? "On" : "Off"}</Text>
      {isDisabled && <Text>Disabled</Text>}
    </View>
  );
}

// Usage
<Switch>
  <CustomSwitchContent />
  <Switch.Thumb />
</Switch>;
```

## Special Notes

### Border Styling

If you need to apply a border to the switch root, use the `outline` style properties instead of `border`. This ensures the border doesn't affect the internal layout calculations for the thumb position:

```tsx
<Switch className="outline outline-accent">
  <Switch.Thumb />
</Switch>
```

Using `outline` keeps the border visual without impacting the switch's internal width calculations, ensuring the thumb animates correctly.

### Integration with ControlField

The Switch component integrates seamlessly with ControlField for press state sharing:

```tsx
import { Description, ControlField, Label } from "heroui-native";

<ControlField isSelected={isSelected} onSelectedChange={setIsSelected}>
  <View className="flex-1">
    <Label>Enable notifications</Label>
    <Description>Receive push notifications</Description>
  </View>
  <ControlField.Indicator />
</ControlField>;
```

When wrapped in ControlField, the Switch will automatically respond to press events on the entire ControlField container, creating a larger touch target and better user experience.
</page>

<page url="/en/docs/native/components/tag-group">
# TagGroup

**Category**: native
**URL**: https://www.heroui.com/en/docs/native/components/tag-group
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/en/native/components/(collections)/tag-group.mdx

> A compound component for displaying and managing selectable tags with optional removal.

---

<NativeVideoPlayerView
  target="auto"
  srcLight="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/tag-group-docs-light.mp4"
  srcDark="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/tag-group-docs-dark.mp4"
/>

## Import

```tsx
import { TagGroup } from "heroui-native";
```

## Anatomy

```tsx
<TagGroup>
  <TagGroup.List>
    <TagGroup.Item id="tag-1">
      <TagGroup.ItemLabel>...</TagGroup.ItemLabel>
      <TagGroup.ItemRemoveButton />
    </TagGroup.Item>
  </TagGroup.List>
</TagGroup>
```

- **TagGroup**: Main container that manages tag selection state, disabled keys, and remove functionality. Provides size and variant context to all child components.
- **TagGroup.List**: Container for rendering the list of tags with optional empty state rendering.
- **TagGroup.Item**: Individual tag within the group. Supports string children (auto-wrapped in TagGroup.ItemLabel), render function children, or custom layouts.
- **TagGroup.ItemLabel**: Text label for the tag. Automatically rendered when string children are provided, or can be used explicitly.
- **TagGroup.ItemRemoveButton**: Remove button for the tag. Must be placed explicitly when removal is needed. Only functional when `onRemove` is provided to TagGroup.

## Usage

### Basic Usage

Display a simple tag group with selectable items.

```tsx
<TagGroup selectionMode="single">
  <TagGroup.List>
    <TagGroup.Item id="news">News</TagGroup.Item>
    <TagGroup.Item id="travel">Travel</TagGroup.Item>
    <TagGroup.Item id="gaming">Gaming</TagGroup.Item>
  </TagGroup.List>
</TagGroup>
```

### Single Selection Mode

Allow only one tag to be selected at a time.

```tsx
<TagGroup selectionMode="single" defaultSelectedKeys={["news"]}>
  <TagGroup.List>
    <TagGroup.Item id="news">News</TagGroup.Item>
    <TagGroup.Item id="travel">Travel</TagGroup.Item>
    <TagGroup.Item id="gaming">Gaming</TagGroup.Item>
  </TagGroup.List>
</TagGroup>
```

### Multiple Selection Mode

Allow multiple tags to be selected simultaneously.

```tsx
<TagGroup selectionMode="multiple" defaultSelectedKeys={["news", "travel"]}>
  <TagGroup.List>
    <TagGroup.Item id="news">News</TagGroup.Item>
    <TagGroup.Item id="travel">Travel</TagGroup.Item>
    <TagGroup.Item id="gaming">Gaming</TagGroup.Item>
  </TagGroup.List>
</TagGroup>
```

### Controlled Selection

Control selection state with `selectedKeys` and `onSelectionChange`.

```tsx
const [selected, setSelected] = useState(new Set(["news"]));

<TagGroup
  selectionMode="single"
  selectedKeys={selected}
  onSelectionChange={setSelected}
>
  <TagGroup.List>
    <TagGroup.Item id="news">News</TagGroup.Item>
    <TagGroup.Item id="travel">Travel</TagGroup.Item>
    <TagGroup.Item id="gaming">Gaming</TagGroup.Item>
  </TagGroup.List>
</TagGroup>;
```

### Variants

Apply different visual variants to the tags.

```tsx
<TagGroup selectionMode="single" variant="default">
  <TagGroup.List>
    <TagGroup.Item id="news">News</TagGroup.Item>
    <TagGroup.Item id="travel">Travel</TagGroup.Item>
  </TagGroup.List>
</TagGroup>

<TagGroup selectionMode="single" variant="surface">
  <TagGroup.List>
    <TagGroup.Item id="news">News</TagGroup.Item>
    <TagGroup.Item id="travel">Travel</TagGroup.Item>
  </TagGroup.List>
</TagGroup>

```

### Sizes

Control the size of all tags in the group.

```tsx
<TagGroup selectionMode="single" size="sm">
  <TagGroup.List>
    <TagGroup.Item id="news">News</TagGroup.Item>
  </TagGroup.List>
</TagGroup>

<TagGroup selectionMode="single" size="md">
  <TagGroup.List>
    <TagGroup.Item id="news">News</TagGroup.Item>
  </TagGroup.List>
</TagGroup>

<TagGroup selectionMode="single" size="lg">
  <TagGroup.List>
    <TagGroup.Item id="news">News</TagGroup.Item>
  </TagGroup.List>
</TagGroup>

```

### With Remove Button

Add remove buttons to tags by providing `onRemove` and placing `TagGroup.ItemRemoveButton` in each item.

```tsx
const [tags, setTags] = useState([
  { id: "news", name: "News" },
  { id: "travel", name: "Travel" },
]);

const onRemove = (keys) => {
  setTags((prev) => prev.filter((tag) => !keys.has(tag.id)));
};

<TagGroup selectionMode="single" onRemove={onRemove}>
  <TagGroup.List>
    {tags.map((tag) => (
      <TagGroup.Item key={tag.id} id={tag.id}>
        <TagGroup.ItemLabel>{tag.name}</TagGroup.ItemLabel>
        <TagGroup.ItemRemoveButton />
      </TagGroup.Item>
    ))}
  </TagGroup.List>
</TagGroup>;
```

### Render Function Children

Use a render function to access `isSelected` and `isDisabled` for custom layouts.

```tsx
<TagGroup selectionMode="single">
  <TagGroup.List>
    <TagGroup.Item id="news">
      {({ isSelected }) => (
        <>
          <SquareArticleIcon
            size={16}
            colorClassName={
              isSelected
                ? "accent-accent-soft-foreground"
                : "accent-field-foreground"
            }
          />
          <TagGroup.ItemLabel>News</TagGroup.ItemLabel>
        </>
      )}
    </TagGroup.Item>
  </TagGroup.List>
</TagGroup>
```

### Empty State

Render custom content when the list has no tags.

```tsx
<TagGroup onRemove={onRemove}>
  <TagGroup.List
    renderEmptyState={() => (
      <Text className="text-sm text-muted">No categories found</Text>
    )}
  >
    {tags.map((tag) => (
      <TagGroup.Item key={tag.id} id={tag.id}>
        <TagGroup.ItemLabel>{tag.name}</TagGroup.ItemLabel>
        <TagGroup.ItemRemoveButton />
      </TagGroup.Item>
    ))}
  </TagGroup.List>
</TagGroup>
```

### Disabled Tags

Disable individual tags or the entire group.

```tsx
<TagGroup selectionMode="single" disabledKeys={new Set(["travel"])}>
  <TagGroup.List>
    <TagGroup.Item id="news">News</TagGroup.Item>
    <TagGroup.Item id="travel">Travel</TagGroup.Item>
    <TagGroup.Item id="gaming" isDisabled>
      Gaming
    </TagGroup.Item>
  </TagGroup.List>
</TagGroup>
```

## Example

```tsx
import { TagGroup, Label, Description, FieldError } from "heroui-native";
import { useState, useMemo } from "react";
import { View } from "react-native";

export default function TagGroupExample() {
  const [selected, setSelected] = useState(new Set());
  const isInvalid = useMemo(
    () => Array.from(selected).length === 0,
    [selected],
  );

  return (
    <View className="gap-4">
      <TagGroup
        selectedKeys={selected}
        selectionMode="multiple"
        onSelectionChange={setSelected}
        isInvalid={isInvalid}
      >
        <Label isInvalid={false}>Amenities</Label>
        <TagGroup.List>
          <TagGroup.Item id="laundry">Laundry</TagGroup.Item>
          <TagGroup.Item id="fitness">Fitness center</TagGroup.Item>
          <TagGroup.Item id="parking">Parking</TagGroup.Item>
          <TagGroup.Item id="pool">Swimming pool</TagGroup.Item>
          <TagGroup.Item id="breakfast">Breakfast</TagGroup.Item>
        </TagGroup.List>
        <Description
          hideOnInvalid
        >{`Selected: ${Array.from(selected).join(", ")}`}</Description>
        <FieldError>Please select at least one category</FieldError>
      </TagGroup>
    </View>
  );
}
```

You can find more examples in the [GitHub repository](<https://github.com/heroui-inc/heroui-native/blob/main/example/src/app/(home)/components/tag-group.tsx>).

## API Reference

### TagGroup

| prop                  | type                               | default     | description                                                      |
| --------------------- | ---------------------------------- | ----------- | ---------------------------------------------------------------- |
| `children`            | `React.ReactNode`                  | -           | Child elements to render inside the tag group                    |
| `size`                | `'sm' \| 'md' \| 'lg'`             | `'md'`      | Size of all tags in the group                                    |
| `variant`             | `'default' \| 'surface'`           | `'default'` | Visual variant of all tags in the group                          |
| `selectionMode`       | `'none' \| 'single' \| 'multiple'` | `'none'`    | The type of selection allowed in the tag group                   |
| `selectedKeys`        | `Iterable<TagKey>`                 | -           | The currently selected keys (controlled)                         |
| `defaultSelectedKeys` | `Iterable<TagKey>`                 | -           | The initial selected keys (uncontrolled)                         |
| `disabledKeys`        | `Iterable<TagKey>`                 | -           | Keys of tags that should be disabled                             |
| `isDisabled`          | `boolean`                          | `false`     | Whether the entire tag group is disabled                         |
| `isInvalid`           | `boolean`                          | `false`     | Whether the tag group is in an invalid state                     |
| `isRequired`          | `boolean`                          | `false`     | Whether the tag group is required                                |
| `className`           | `string`                           | -           | Additional CSS classes for the tag group container               |
| `style`               | `StyleProp<ViewStyle>`             | -           | Additional styles for the tag group container                    |
| `animation`           | `"disable-all" \| undefined`       | -           | Use `"disable-all"` to disable all animations including children |
| `onSelectionChange`   | `(keys: Set<TagKey>) => void`      | -           | Handler called when the selection changes                        |
| `onRemove`            | `(keys: Set<TagKey>) => void`      | -           | Handler called when tags are removed                             |
| `...ViewProps`        | `ViewProps`                        | -           | All standard React Native View props are supported               |

#### TagKey

`string | number` — Key type for identifying tags within a TagGroup.

#### Animation

Use `animation="disable-all"` to disable all animations including children. Omit or use `undefined` for default animations.

### TagGroup.List

| prop               | type                    | default | description                                        |
| ------------------ | ----------------------- | ------- | -------------------------------------------------- |
| `children`         | `React.ReactNode`       | -       | Child elements to render inside the list           |
| `className`        | `string`                | -       | Additional CSS classes for the list container      |
| `style`            | `StyleProp<ViewStyle>`  | -       | Additional styles for the list container           |
| `renderEmptyState` | `() => React.ReactNode` | -       | Function to render when the list has no tags       |
| `...ViewProps`     | `ViewProps`             | -       | All standard React Native View props are supported |

### TagGroup.Item

| prop                | type                                                                    | default | description                                                                  |
| ------------------- | ----------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------- |
| `children`          | `React.ReactNode \| ((renderProps: TagRenderProps) => React.ReactNode)` | -       | Tag content: string, elements, or a render function receiving TagRenderProps |
| `id`                | `TagKey`                                                                | -       | Unique identifier for this tag                                               |
| `isDisabled`        | `boolean`                                                               | -       | Whether this specific tag is disabled                                        |
| `className`         | `string`                                                                | -       | Additional CSS classes for the tag                                           |
| `style`             | `StyleProp<ViewStyle>`                                                  | -       | Additional styles for the tag                                                |
| `...PressableProps` | `PressableProps`                                                        | -       | All standard React Native Pressable props are supported                      |

#### TagRenderProps

| prop         | type      | description                                                                 |
| ------------ | --------- | --------------------------------------------------------------------------- |
| `isSelected` | `boolean` | Whether the tag is currently selected                                       |
| `isDisabled` | `boolean` | Whether the tag is disabled (merged from root, disabledKeys, and item prop) |

### TagGroup.ItemLabel

| prop           | type              | default | description                                        |
| -------------- | ----------------- | ------- | -------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Text content to render                             |
| `className`    | `string`          | -       | Additional CSS classes for the label               |
| `...TextProps` | `TextProps`       | -       | All standard React Native Text props are supported |

### TagGroup.ItemRemoveButton

| prop                | type                       | default | description                                                                              |
| ------------------- | -------------------------- | ------- | ---------------------------------------------------------------------------------------- |
| `children`          | `React.ReactNode`          | -       | Custom icon or content for the remove button. Defaults to close icon when omitted        |
| `className`         | `string`                   | -       | Additional CSS classes for the remove button                                             |
| `iconProps`         | `TagRemoveButtonIconProps` | -       | Props for customizing the default close icon. Only applies when no children are provided |
| `hitSlop`           | `number`                   | `8`     | Extends the touchable area                                                               |
| `...PressableProps` | `PressableProps`           | -       | All standard React Native Pressable props are supported                                  |

#### TagRemoveButtonIconProps

| prop    | type     | default | description       |
| ------- | -------- | ------- | ----------------- |
| `size`  | `number` | `12`    | Size of the icon  |
| `color` | `string` | -       | Color of the icon |

## Hooks

### useTagGroup

Hook to access the tag group root context. Must be used within a `TagGroup` component.

```tsx
import { useTagGroup } from "heroui-native";

const {
  selectedKeys,
  disabledKeys,
  selectionMode,
  onSelectionChange,
  onRemove,
  isDisabled,
  isInvalid,
  isRequired,
} = useTagGroup();
```

#### Returns

| property            | type                                         | description                                    |
| ------------------- | -------------------------------------------- | ---------------------------------------------- |
| `selectionMode`     | `'none' \| 'single' \| 'multiple'`           | The type of selection allowed in the tag group |
| `selectedKeys`      | `Set<TagKey>`                                | Currently selected tag keys                    |
| `disabledKeys`      | `Set<TagKey>`                                | Keys of disabled tags                          |
| `onSelectionChange` | `(keys: Set<TagKey>) => void`                | Callback when selection changes                |
| `onRemove`          | `((keys: Set<TagKey>) => void) \| undefined` | Callback when tags are removed                 |
| `isDisabled`        | `boolean`                                    | Whether the entire tag group is disabled       |
| `isInvalid`         | `boolean`                                    | Whether the tag group is in an invalid state   |
| `isRequired`        | `boolean`                                    | Whether the tag group is required              |

### useTagGroupItem

Hook to access the tag item context. Must be used within a `TagGroup.Item` component.

```tsx
import { useTagGroupItem } from "heroui-native";

const { id, isSelected, isDisabled, allowsRemoving } = useTagGroupItem();
```

#### Returns

| property         | type      | description                                                                 |
| ---------------- | --------- | --------------------------------------------------------------------------- |
| `id`             | `TagKey`  | Unique identifier for this tag                                              |
| `isSelected`     | `boolean` | Whether the tag is currently selected                                       |
| `isDisabled`     | `boolean` | Whether the tag is disabled                                                 |
| `allowsRemoving` | `boolean` | Whether the tag can be removed (true when onRemove is provided to TagGroup) |

</page>

<page url="/en/docs/native/components/text">
# Typography

**Category**: native
**URL**: https://www.heroui.com/en/docs/native/components/text
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/en/native/components/(typography)/text.mdx

> Primitive typography component for rendering styled text with semantic type variants.

---

<NativeVideoPlayerView
  target="auto"
  srcLight="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/text-docs-light.mp4"
  srcDark="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/text-docs-dark.mp4"
/>

## Import

```tsx
import { Typography } from "heroui-native";
```

## Anatomy

```tsx
<Typography>...</Typography>

{/* Sub-components */}
<Typography.Heading>...</Typography.Heading>
<Typography.Paragraph>...</Typography.Paragraph>
<Typography.Code>...</Typography.Code>

```

- **Typography**: Root text element. Selects a typography preset via `type` and exposes orthogonal `align`, `color`, `weight`, and `truncate` props.
- **Typography.Heading**: Convenience wrapper restricted to heading types (`h1`–`h6`). Adds `accessibilityRole="header"` automatically.
- **Typography.Paragraph**: Convenience wrapper restricted to body types (`body`, `body-sm`, `body-xs`).
- **Typography.Code**: Chip-styled inline monospaced text. Uses a platform-appropriate monospace font family.

## Usage

### Basic Usage

The Typography component renders body text by default.

```tsx
<Typography>Hello, world!</Typography>
```

### Type Variants

Use the `type` prop to select a semantic typography preset.

```tsx
<Typography type="h1">Heading 1</Typography>
<Typography type="h2">Heading 2</Typography>
<Typography type="h3">Heading 3</Typography>
<Typography type="h4">Heading 4</Typography>
<Typography type="h5">Heading 5</Typography>
<Typography type="h6">Heading 6</Typography>
<Typography type="body">Body text</Typography>
<Typography type="body-sm">Small body text</Typography>
<Typography type="body-xs">Extra-small body text</Typography>
<Typography type="code">Code snippet</Typography>

```

### Headings

Use `Typography.Heading` for heading text with automatic header accessibility role.

```tsx
<Typography.Heading type="h1">Page Title</Typography.Heading>
<Typography.Heading type="h2">Section Title</Typography.Heading>
<Typography.Heading type="h3">Subsection Title</Typography.Heading>

```

### Paragraphs

Use `Typography.Paragraph` for body text.

```tsx
<Typography.Paragraph>
  This is a paragraph of body text with the default size.
</Typography.Paragraph>
<Typography.Paragraph type="body-sm">
  This is smaller body text.
</Typography.Paragraph>

```

### Code

Use `Typography.Code` (or equivalently `<Typography type="code">`) for inline code snippets. Both render a chip-styled, monospaced inline element with a subtle background, rounded corners, and a `self-start` layout so it does not stretch in flex containers. The platform monospace `fontFamily` is applied at the `Typography` root, so the two forms are interchangeable.

```tsx
<Typography.Code>console.log('hello')</Typography.Code>
<Typography type="code">console.log('hello')</Typography>

```

### Alignment

Use the `align` prop to control horizontal alignment. `start` and `end` are RTL-aware (they flip under right-to-left layouts).

```tsx
<Typography align="start">Start-aligned</Typography>
<Typography align="center">Center-aligned</Typography>
<Typography align="end">End-aligned</Typography>
<Typography align="justify">Justified text spreads across the line.</Typography>

```

> **Note:** `text-justify` is iOS-only on React Native; Android falls back to left alignment.

### Color

Use the `color` prop to apply a semantic foreground color preset.

```tsx
<Typography color="default">Default foreground</Typography>
<Typography color="muted">Muted secondary text</Typography>

```

For other theme colors, pass the corresponding utility through `className` (e.g. `className="text-accent"`, `className="text-danger"`).

### Weight

Use the `weight` prop to override the font weight implied by `type`. The override merges via `tailwind-merge`, so it always wins over the type variant's default weight.

```tsx
<Typography type="h1" weight="bold">Bold H1</Typography>
<Typography weight="medium">Medium body</Typography>
<Typography weight="semibold">Semibold body</Typography>

```

### Truncation

Use the `truncate` boolean prop to limit the text to a single line with an ellipsis. It is mapped to React Native's `numberOfLines={1}`. An explicit `numberOfLines` prop, if provided, takes precedence.

```tsx
<Typography truncate>
  A long line of text that will be cut off with an ellipsis when it overflows
  the container.
</Typography>;

{
  /* Multi-line truncation via the underlying RN prop */
}
<Typography numberOfLines={2}>
  Two-line truncation works through React Native's standard `numberOfLines`
  prop.
</Typography>;
```

## Example

```tsx
import { Typography } from "heroui-native";
import { View } from "react-native";

export default function TypographyExample() {
  return (
    <View className="flex-1 justify-center px-5 gap-4">
      <Typography.Heading type="h1">Welcome</Typography.Heading>
      <Typography.Heading type="h3">Getting Started</Typography.Heading>
      <Typography.Paragraph>
        This is a body paragraph rendered with the Typography component.
      </Typography.Paragraph>
      <Typography.Paragraph color="muted" type="body-sm">
        Smaller supporting text for captions or footnotes.
      </Typography.Paragraph>
      <Typography.Code>npm install heroui-native</Typography.Code>
    </View>
  );
}
```

You can find more examples in the [GitHub repository](<https://github.com/heroui-inc/heroui-native/blob/main/example/src/app/(home)/components/text.tsx>).

## API Reference

### Typography

`Typography` extends all standard React Native `TextProps` with additional typography props.

| prop           | type                                                                                         | default     | description                                                                                                                    |
| -------------- | -------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `type`         | `'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6' \| 'body' \| 'body-sm' \| 'body-xs' \| 'code'` | `'body'`    | Semantic typography variant (size, default weight, line-height)                                                                |
| `align`        | `'start' \| 'center' \| 'end' \| 'justify'`                                                  | `'start'`   | Horizontal alignment. `start` and `end` are RTL-aware. `justify` is iOS-only.                                                  |
| `color`        | `'default' \| 'muted'`                                                                       | `'default'` | Semantic foreground color preset                                                                                               |
| `weight`       | `'normal' \| 'medium' \| 'semibold' \| 'bold'`                                               | -           | Font weight override. When set, overrides the weight implied by `type`.                                                        |
| `truncate`     | `boolean`                                                                                    | `false`     | Truncates the text to a single line with an ellipsis (sets `numberOfLines={1}`). An explicit `numberOfLines` takes precedence. |
| `children`     | `React.ReactNode`                                                                            | -           | Content to render                                                                                                              |
| `className`    | `string`                                                                                     | -           | Additional CSS classes                                                                                                         |
| `...TextProps` | `TextProps`                                                                                  | -           | All standard React Native `Text` props are supported                                                                           |

### Typography.Heading

Inherits all `Typography` root props (`align`, `color`, `weight`, `truncate`, `className`, and React Native `TextProps`). Sets `accessibilityRole="header"` automatically and narrows `type` to heading variants.

| prop           | type                                           | default | description                                          |
| -------------- | ---------------------------------------------- | ------- | ---------------------------------------------------- |
| `type`         | `'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6'` | `'h1'`  | Heading level                                        |
| `children`     | `React.ReactNode`                              | -       | Content to render                                    |
| `className`    | `string`                                       | -       | Additional CSS classes                               |
| `...TextProps` | `TextProps`                                    | -       | All standard React Native `Text` props are supported |

### Typography.Paragraph

Inherits all `Typography` root props (`align`, `color`, `weight`, `truncate`, `className`, and React Native `TextProps`). Narrows `type` to body variants.

| prop           | type                               | default  | description                                          |
| -------------- | ---------------------------------- | -------- | ---------------------------------------------------- |
| `type`         | `'body' \| 'body-sm' \| 'body-xs'` | `'body'` | Paragraph text size                                  |
| `children`     | `React.ReactNode`                  | -        | Content to render                                    |
| `className`    | `string`                           | -        | Additional CSS classes                               |
| `...TextProps` | `TextProps`                        | -        | All standard React Native `Text` props are supported |

### Typography.Code

Inherits all `Typography` root props (`align`, `color`, `weight`, `truncate`, `className`, `style`, and React Native `TextProps`). Thin wrapper that forces `type="code"`; the platform monospace `fontFamily` is merged in at the `Typography` root, so `<Typography type="code">` and `<Typography.Code>` render identically.

| prop           | type              | default | description                                          |
| -------------- | ----------------- | ------- | ---------------------------------------------------- |
| `children`     | `React.ReactNode` | -       | Content to render                                    |
| `className`    | `string`          | -       | Additional CSS classes                               |
| `...TextProps` | `TextProps`       | -       | All standard React Native `Text` props are supported |

</page>

<page url="/en/docs/native/components/text-field">
# TextField

**Category**: native
**URL**: https://www.heroui.com/en/docs/native/components/text-field
**Source**: https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3/apps/docs/content/docs/en/native/components/(forms)/text-field.mdx

> A text input component with label, description, and error handling for collecting user input.

---

<NativeVideoPlayerView
  target="auto"
  srcLight="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/text-field-docs-light.mp4"
  srcDark="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/native/components/videos/text-field-docs-dark.mp4"
/>

## Import

```tsx
import { TextField } from "heroui-native";
```

## Anatomy

```tsx
<TextField>
  <Label>...</Label>
  <Input />
  <Description>...</Description>
  <FieldError>...</FieldError>
</TextField>
```

- **TextField**: Root container that provides spacing and state management
- **Label**: Label with optional asterisk for required fields (from [Label](./label) component)
- **Input**: Input container with animated border and background (from [Input](./input) component)
- **Description**: Secondary descriptive helper text (from [Description](./description) component)
- **FieldError**: Validation error message display (from [FieldError](./field-error) component)

## Usage

### Basic Usage

TextField provides a complete form input structure with label and description.

```tsx
<TextField>
  <Label>Email</Label>
  <Input placeholder="Enter your email" />
  <Description>We'll never share your email</Description>
</TextField>
```

### With Required Field

Mark fields as required to show an asterisk in the label.

```tsx
<TextField isRequired>
  <Label>Username</Label>
  <Input placeholder="Choose a username" />
</TextField>
```

### With Validation

Display error messages when the field is invalid.

```tsx
import { FieldError, Input, Label, TextField } from "heroui-native";

<TextField isRequired isInvalid={true}>
  <Label>Email</Label>
  <Input placeholder="Enter your email" />
  <FieldError>Please enter a valid email</FieldError>
</TextField>;
```

### With Local Invalid State Override

Override the context's invalid state for individual components.

```tsx
import {
  Description,
  FieldError,
  Input,
  Label,
  TextField,
} from "heroui-native";

<TextField isInvalid={true}>
  <Label isInvalid={false}>Email</Label>
  <Input placeholder="Enter your email" isInvalid={false} />
  <Description isInvalid={false}>
    This shows despite input being invalid
  </Description>
  <FieldError>Email format is incorrect</FieldError>
</TextField>;
```

### Multiline Input

Create text areas for longer content.

```tsx
<TextField>
  <Label>Message</Label>
  <Input placeholder="Type your message..." multiline numberOfLines={4} />
  <Description>Maximum 500 characters</Description>
</TextField>
```

### Disabled State

Disable the entire field to prevent interaction.

```tsx
<TextField isDisabled>
  <Label>Disabled Field</Label>
  <Input placeholder="Cannot edit" value="Read only value" />
</TextField>
```

### With Variant

Use different variants to style the input based on context.

```tsx
<TextField>
  <Label>Primary Variant</Label>
  <Input placeholder="Primary style" variant="primary" />
</TextField>

<TextField>
  <Label>Secondary Variant</Label>
  <Input placeholder="Secondary style" variant="secondary" />
</TextField>

```

### Custom Styling

Customize the input appearance using className.

```tsx
<TextField>
  <Label>Custom Styled</Label>
  <Input
    placeholder="Custom colors"
    className="bg-blue-50 border-blue-500 focus:border-blue-700"
  />
</TextField>
```

## Example

```tsx
import { Ionicons } from "@expo/vector-icons";
import { Description, Input, Label, TextField } from "heroui-native";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledIonicons = withUniwind(Ionicons);

export const TextInputContent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View className="gap-4">
      <TextField isRequired>
        <Label>Email</Label>
        <Input
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <Description>
          We'll never share your email with anyone else.
        </Description>
      </TextField>

      <TextField isRequired>
        <Label>New password</Label>
        <View className="w-full flex-row items-center">
          <Input
            value={password}
            onChangeText={setPassword}
            className="flex-1 px-10"
            placeholder="Enter your password"
            secureTextEntry={!isPasswordVisible}
          />
          <StyledIonicons
            name="lock-closed-outline"
            size={16}
            className="absolute left-3.5 text-muted"
            pointerEvents="none"
          />
          <Pressable
            className="absolute right-4"
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <StyledIonicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={16}
              className="text-muted"
            />
          </Pressable>
        </View>
        <Description>Password must be at least 6 characters</Description>
      </TextField>
    </View>
  );
};
```

You can find more examples in the [GitHub repository](<https://github.com/heroui-inc/heroui-native/blob/main/example/src/app/(home)/components/text-field.tsx>).

## API Reference

### TextField

| prop         | type                         | default     | description                                                                               |
| ------------ | ---------------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| children     | `React.ReactNode`            | -           | Content to render inside the text field                                                   |
| isDisabled   | `boolean`                    | `false`     | Whether the entire text field is disabled                                                 |
| isInvalid    | `boolean`                    | `false`     | Whether the text field is in an invalid state                                             |
| isRequired   | `boolean`                    | `false`     | Whether the text field is required (shows asterisk)                                       |
| className    | `string`                     | -           | Custom class name for the root element                                                    |
| animation    | `"disable-all" \| undefined` | `undefined` | Animation configuration. Use `"disable-all"` to disable all animations including children |
| ...ViewProps | `ViewProps`                  | -           | All standard React Native View props are supported                                        |

> **Note**: For Label, Input, Description, and FieldError components, see their respective documentation:
>
> - [Label documentation](./label)
> - [Input documentation](./input)
> - [Description documentation](./description)
> - [FieldError documentation](./field-error)
>
> These components automatically consume form state from TextField via the form-item-state context.

## Hooks

### useTextField

Hook to access the TextField context values. Must be used within a `TextField` component.

```tsx
import { TextField, useTextField } from "heroui-native";

function CustomComponent() {
  const { isDisabled, isInvalid, isRequired } = useTextField();

  // Use the context values...
}
```

#### Returns

| property   | type      | description                                   |
| ---------- | --------- | --------------------------------------------- |
| isDisabled | `boolean` | Whether the entire text field is disabled     |
| isInvalid  | `boolean` | Whether the text field is in an invalid state |
| isRequired | `boolean` | Whether the text field is required            |

</page>
