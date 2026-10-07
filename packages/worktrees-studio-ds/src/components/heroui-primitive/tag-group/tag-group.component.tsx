import { TagGroup as HeroTagGroup } from "heroui-native/tag-group";
import type { ComponentProps } from "react";

export type UiTagGroupProps = ComponentProps<typeof HeroTagGroup>;

export const UiTagGroup = Object.assign(function UiTagGroup(props: UiTagGroupProps) {
  return <HeroTagGroup {...props} />;
}, HeroTagGroup);
UiTagGroup.displayName = "UiTagGroup";
