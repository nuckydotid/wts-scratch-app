import type { ComponentDef } from "./index";
import { FieldError, UiView } from "../../../components";
import * as C from "./controls";

export const UIFieldError: ComponentDef = {
  label: "UIFieldError",
  category: "heroui-primitive",
  controls: {
    children: C.txt("This field is required"),
    isInvalid: C.bool(true),
  },
  render: (p) => (
    <UiView className="w-full">
      <FieldError isInvalid={p.isInvalid as boolean}>{p.children as string}</FieldError>
    </UiView>
  ),
};
