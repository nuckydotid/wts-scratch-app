import { RadioGroup as HeroRadioGroup } from "heroui-native/radio-group";
import type { ComponentProps } from "react";

export type UiRadioGroupProps = ComponentProps<typeof HeroRadioGroup>;

export const UiRadioGroup = Object.assign(function UiRadioGroup(props: UiRadioGroupProps) {
  return <HeroRadioGroup {...props} />;
}, HeroRadioGroup);
UiRadioGroup.displayName = "UiRadioGroup";
