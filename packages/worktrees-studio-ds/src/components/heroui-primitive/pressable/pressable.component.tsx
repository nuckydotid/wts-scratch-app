import { Pressable } from "react-native";
import type { ComponentProps } from "react";

export type UiPressableProps = ComponentProps<typeof Pressable>;

export function UiPressable({ focusable = false, ...props }: UiPressableProps) {
  return <Pressable focusable={focusable} {...props} />;
}
