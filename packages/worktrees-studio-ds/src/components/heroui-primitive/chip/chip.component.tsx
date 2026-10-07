import { Chip as HeroChip } from "heroui-native/chip";
import type { ComponentProps } from "react";

export type UiChipProps = ComponentProps<typeof HeroChip>;

export const UiChip = Object.assign(function UiChip(props: UiChipProps) {
  return <HeroChip {...props} />;
}, HeroChip);
UiChip.displayName = "UiChip";
