import type { ComponentDef } from "./index";
import { ControlField, UiText } from "../../../components";
import * as C from "./controls";

export const UIControlField: ComponentDef = {
  label: "UIControlField",
  category: "heroui-primitive",
  controls: {
    indicatorVariant: C.select(C.INDICATOR_VARIANTS, "switch"),
    isSelected: C.isSelected,
    isDisabled: C.isDisabled,
    isInvalid: C.isInvalid,
    isRequired: C.isRequired,
  },
  render: (p) => (
    <ControlField
      isSelected={p.isSelected as boolean}
      isDisabled={p.isDisabled as boolean}
      isInvalid={p.isInvalid as boolean}
      isRequired={p.isRequired as boolean}
    >
      <ControlField.Indicator variant={p.indicatorVariant as any} />
      <UiText className="text-foreground">Control option</UiText>
    </ControlField>
  ),
};
