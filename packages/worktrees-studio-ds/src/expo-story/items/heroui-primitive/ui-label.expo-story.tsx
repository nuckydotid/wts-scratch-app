import type { ComponentDef } from "./index";
import { UiLabel } from "../../../components";
import * as C from "./controls";

export const UILabel: ComponentDef = {
  label: "UILabel",
  category: "heroui-primitive",
  controls: {
    isRequired: C.isRequired,
    isInvalid: C.isInvalid,
    isDisabled: C.isDisabled,
    children: C.txt("Email Address"),
  },
  render: (p) => (
    <UiLabel
      isRequired={p.isRequired as boolean}
      isInvalid={p.isInvalid as boolean}
      isDisabled={p.isDisabled as boolean}
    >
      {p.children as string}
    </UiLabel>
  ),
};
