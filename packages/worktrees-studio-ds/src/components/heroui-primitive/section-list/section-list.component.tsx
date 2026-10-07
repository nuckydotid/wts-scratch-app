import { SectionList } from "react-native";
import type { ComponentProps } from "react";

export type UiSectionListProps<T, S> = ComponentProps<typeof SectionList<T, S>>;

export function UiSectionList<T, S>(props: UiSectionListProps<T, S>) {
  return (
    <SectionList
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      // No rubber-band/overscroll bounce by default (Android + iOS), matching
      // UiFlatList. Callers can override.
      overScrollMode="never"
      bounces={false}
      {...props}
    />
  );
}
