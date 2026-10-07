import { TextArea } from "heroui-native/text-area";
import type { ComponentProps } from "react";

export type UiTextAreaProps = ComponentProps<typeof TextArea>;

export function UiTextArea({ className, ...props }: UiTextAreaProps) {
  return <TextArea className={`font-normal ${className ?? ""}`} {...props} />;
}
