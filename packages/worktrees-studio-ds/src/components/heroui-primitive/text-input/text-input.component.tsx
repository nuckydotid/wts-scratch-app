import { TextInput } from "react-native";
import type { ComponentProps } from "react";

export type UiTextInputProps = ComponentProps<typeof TextInput>;

export function UiTextInput(props: UiTextInputProps) {
  return <TextInput {...props} />;
}
