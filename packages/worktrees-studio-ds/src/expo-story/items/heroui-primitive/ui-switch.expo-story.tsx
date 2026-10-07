import type { ComponentDef } from "./index";
import { UiSwitch, UiView } from "../../../components";
import * as C from "./controls";

export const UISwitch: ComponentDef = {
  label: "UISwitch",
  category: "heroui-primitive",
  controls: {
    isSelected: C.isSelected,
    isDisabled: C.isDisabled,
  },
  render: (p) => (
    <UiView className="flex-row items-center gap-2">
      <UiSwitch isSelected={p.isSelected as boolean} isDisabled={p.isDisabled as boolean} />
    </UiView>
  ),
};
