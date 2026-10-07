import { LinkButton } from "heroui-native/link-button";
import type { ComponentProps } from "react";

export type UiLinkButtonProps = ComponentProps<typeof LinkButton>;

export function UiLinkButton(props: UiLinkButtonProps) {
  return <LinkButton {...props} />;
}
