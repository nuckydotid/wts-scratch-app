import type { ComponentDef } from "./index";
import { UiCloseButton } from "../../../components";
import * as C from "./controls";

export const UICloseButton: ComponentDef = {
  label: "UICloseButton",
  category: "heroui-primitive",
  controls: {
    isDisabled: C.isDisabled,
  },
  render: (p) => <UiCloseButton isDisabled={p.isDisabled as boolean} />,
};
