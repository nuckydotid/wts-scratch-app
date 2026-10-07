import { View } from "react-native";
import type { ComponentProps, Ref } from "react";

/** React 19 passes `ref` as an ordinary prop, so it is forwarded to the underlying `View` with the rest. */
export type UiViewProps = ComponentProps<typeof View> & { ref?: Ref<View> };

export function UiView(props: UiViewProps) {
  return <View {...props} />;
}
