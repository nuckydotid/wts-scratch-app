import { Switch } from "heroui-native/switch";
import type { ComponentProps } from "react";

export type UiSwitchProps = ComponentProps<typeof Switch>;

export function UiSwitch(props: UiSwitchProps) {
  return <Switch {...props} />;
}
