import type { ComponentDef } from "./index";
import { UiTextField, UiLabel, UiInput, Description, FieldError } from "../../../components";
import * as C from "./controls";

export const UITextField: ComponentDef = {
  label: "UITextField",
  category: "heroui-primitive",
  controls: {
    isDisabled: C.isDisabled,
    isInvalid: C.isInvalid,
    isRequired: C.isRequired,
    placeholder: C.txt("Enter your name"),
  },
  render: (p) => (
    <UiTextField
      isDisabled={p.isDisabled as boolean}
      isInvalid={p.isInvalid as boolean}
      isRequired={p.isRequired as boolean}
    >
      <UiLabel>Full Name</UiLabel>
      <UiInput placeholder={p.placeholder as string} />
      <Description>Enter your first and last name</Description>
      <FieldError>This field is required</FieldError>
    </UiTextField>
  ),
};
