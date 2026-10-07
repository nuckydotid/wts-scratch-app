import { CloseButton } from "heroui-native/close-button";
import type { ComponentProps } from "react";

export type UiCloseButtonProps = ComponentProps<typeof CloseButton>;

export function UiCloseButton(props: UiCloseButtonProps) {
  return <CloseButton {...props} />;
}
