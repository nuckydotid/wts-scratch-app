import { Radio as HeroRadio } from "heroui-native/radio";
import type { ComponentProps } from "react";

export type UiRadioProps = ComponentProps<typeof HeroRadio>;

export const UiRadio = Object.assign(function UiRadio(props: UiRadioProps) {
  return <HeroRadio {...props} />;
}, HeroRadio);
UiRadio.displayName = "UiRadio";
