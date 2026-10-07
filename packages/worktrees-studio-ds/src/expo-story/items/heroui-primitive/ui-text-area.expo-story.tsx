import type { ComponentDef } from "./index";
import { UiTextArea } from "../../../components";
import * as C from "./controls";

export const UITextArea: ComponentDef = {
  label: "UITextArea",
  category: "heroui-primitive",
  controls: {
    variant: C.primarySecondary,
    isDisabled: C.isDisabled,
    isInvalid: C.isInvalid,
    placeholder: C.txt("Enter description..."),
  },
  render: (p) => (
    <UiTextArea
      variant={p.variant as any}
      isDisabled={p.isDisabled as boolean}
      isInvalid={p.isInvalid as boolean}
      placeholder={p.placeholder as string}
    />
  ),
};
