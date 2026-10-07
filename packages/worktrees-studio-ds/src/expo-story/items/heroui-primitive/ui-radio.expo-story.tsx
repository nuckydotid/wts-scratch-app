import type { ComponentDef } from "./index";
import { UiRadio, UiText } from "../../../components";
import * as C from "./controls";

export const UIRadio: ComponentDef = {
  label: "UIRadio",
  category: "heroui-primitive",
  controls: {
    variant: C.primarySecondary,
    isSelected: C.isSelected,
    isDisabled: C.isDisabled,
    isInvalid: C.isInvalid,
  },
  render: (p) => (
    <UiRadio
      variant={p.variant as any}
      isSelected={p.isSelected as boolean}
      isDisabled={p.isDisabled as boolean}
      isInvalid={p.isInvalid as boolean}
    >
      <UiRadio.Indicator />
      <UiText className="text-foreground">Option</UiText>
    </UiRadio>
  ),
};
