import { Avatar as HeroAvatar } from "heroui-native/avatar";
import type { ComponentProps } from "react";

export type UiAvatarProps = ComponentProps<typeof HeroAvatar>;

export const UiAvatar = Object.assign(function UiAvatar(props: UiAvatarProps) {
  return <HeroAvatar {...props} />;
}, HeroAvatar);
UiAvatar.displayName = "UiAvatar";
