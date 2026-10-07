import { Tabs as HeroTabs } from "heroui-native/tabs";
import type { ComponentProps } from "react";

export type UiTabsProps = ComponentProps<typeof HeroTabs>;

export const UiTabs = Object.assign(function UiTabs(props: UiTabsProps) {
  return <HeroTabs {...props} />;
}, HeroTabs);
UiTabs.displayName = "UiTabs";
