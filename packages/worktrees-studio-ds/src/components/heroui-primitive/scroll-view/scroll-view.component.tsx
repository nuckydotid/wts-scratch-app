import { ScrollView } from "react-native";
import type { ComponentProps } from "react";

export type UiScrollViewProps = ComponentProps<typeof ScrollView>;

export function UiScrollView(props: UiScrollViewProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      // No rubber-band/overscroll bounce by default (Android + iOS); pull-to-
      // refresh via RefreshControl still works. Callers can override.
      overScrollMode="never"
      bounces={false}
      {...props}
    />
  );
}
