import { ListGroup as HeroListGroup } from "heroui-native/list-group";
import type { ComponentProps } from "react";

export type UiListGroupProps = ComponentProps<typeof HeroListGroup>;

export const UiListGroup = Object.assign(function UiListGroup(props: UiListGroupProps) {
  return <HeroListGroup {...props} />;
}, HeroListGroup);
UiListGroup.displayName = "UiListGroup";
