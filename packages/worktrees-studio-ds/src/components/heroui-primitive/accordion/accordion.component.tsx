import { Accordion as HeroAccordion } from "heroui-native/accordion";
import type { ComponentProps } from "react";

export type UiAccordionProps = ComponentProps<typeof HeroAccordion>;

export const UiAccordion = Object.assign(function UiAccordion(props: UiAccordionProps) {
  return <HeroAccordion animation={{ state: "disable-all" }} {...props} />;
}, HeroAccordion);
UiAccordion.displayName = "UiAccordion";
