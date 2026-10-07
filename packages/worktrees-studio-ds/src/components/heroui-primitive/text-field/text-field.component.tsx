import { TextField } from "heroui-native/text-field";
import type { ComponentProps } from "react";

export type UiTextFieldProps = ComponentProps<typeof TextField>;

export function UiTextField(props: UiTextFieldProps) {
  return <TextField {...props} />;
}
