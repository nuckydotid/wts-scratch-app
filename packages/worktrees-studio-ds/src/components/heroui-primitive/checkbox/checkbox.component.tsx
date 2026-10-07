import { Checkbox } from "heroui-native/checkbox";
import type { ComponentProps } from "react";

export type UiCheckboxProps = ComponentProps<typeof Checkbox>;

export function UiCheckbox(props: UiCheckboxProps) {
  return <Checkbox {...props} />;
}
