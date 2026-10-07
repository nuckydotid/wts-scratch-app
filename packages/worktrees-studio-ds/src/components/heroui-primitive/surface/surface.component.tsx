import { Surface } from "heroui-native/surface";
import type { ComponentProps } from "react";

export type UiSurfaceProps = ComponentProps<typeof Surface>;

export function UiSurface(props: UiSurfaceProps) {
  return <Surface {...props} />;
}
