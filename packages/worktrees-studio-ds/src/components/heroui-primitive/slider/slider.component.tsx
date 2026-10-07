import { Slider as HeroSlider } from "heroui-native/slider";
import type { ComponentProps } from "react";

export type UiSliderProps = ComponentProps<typeof HeroSlider>;

export const UiSlider = Object.assign(function UiSlider(props: UiSliderProps) {
  return <HeroSlider {...props} />;
}, HeroSlider);
UiSlider.displayName = "UiSlider";
