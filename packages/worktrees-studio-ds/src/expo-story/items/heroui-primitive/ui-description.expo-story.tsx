import type { ComponentDef } from "./index";
import { Description, UiView } from "../../../components";
import * as C from "./controls";

export const UIDescription: ComponentDef = {
  label: "UIDescription",
  category: "heroui-primitive",
  controls: {
    children: C.txt("Helper text for a form field."),
    isDisabled: C.isDisabled,
    isInvalid: C.isInvalid,
    hideOnInvalid: C.hideOnInvalid,
  },
  render: (p) => (
    <UiView className="w-full">
      <Description
        isDisabled={p.isDisabled as boolean}
        isInvalid={p.isInvalid as boolean}
        hideOnInvalid={p.hideOnInvalid as boolean}
      >
        {p.children as string}
      </Description>
    </UiView>
  ),
};
