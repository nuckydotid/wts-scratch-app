import type { ComponentDef } from "./index";
import { ControlField, UiText } from "../../../components";
import * as C from "./controls";

export const UICheckbox: ComponentDef = {
  label: "UICheckbox",
  category: "heroui-primitive",
  controls: {
    isSelected: C.isSelected,
    isDisabled: C.isDisabled,
    isInvalid: C.isInvalid,
  },
  render: (p) => (
    <ControlField
      isSelected={p.isSelected as boolean}
      isDisabled={p.isDisabled as boolean}
      isInvalid={p.isInvalid as boolean}
    >
      <ControlField.Indicator variant="checkbox" />
      <UiText className="text-foreground">Accept terms</UiText>
    </ControlField>
  ),
};
