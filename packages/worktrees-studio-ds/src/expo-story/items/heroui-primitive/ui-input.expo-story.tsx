import type { ComponentDef } from "./index";
import { UiInput } from "../../../components";
import * as C from "./controls";

export const UIInput: ComponentDef = {
  label: "UIInput",
  category: "heroui-primitive",
  controls: {
    variant: C.primarySecondary,
    isDisabled: C.isDisabled,
    isInvalid: C.isInvalid,
    placeholder: C.txt("Enter text..."),
  },
  render: (p) => (
    <UiInput
      variant={p.variant as any}
      isDisabled={p.isDisabled as boolean}
      isInvalid={p.isInvalid as boolean}
      placeholder={p.placeholder as string}
    />
  ),
};
