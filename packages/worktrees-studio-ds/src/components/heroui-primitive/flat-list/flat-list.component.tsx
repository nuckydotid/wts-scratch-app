import { FlatList } from "react-native";
import type { ComponentProps } from "react";

export type UiFlatListProps<T> = ComponentProps<typeof FlatList<T>>;

export function UiFlatList<T>(props: UiFlatListProps<T>) {
  return (
    <FlatList
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
