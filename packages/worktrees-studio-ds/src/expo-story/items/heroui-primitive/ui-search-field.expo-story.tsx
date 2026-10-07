import type { ComponentDef } from "./index";
import { UiSearchField } from "../../../components";
import * as C from "./controls";

export const UISearchField: ComponentDef = {
  label: "UISearchField",
  category: "heroui-primitive",
  controls: {
    isDisabled: C.isDisabled,
    isInvalid: C.isInvalid,
  },
  render: (p) => (
    <UiSearchField isDisabled={p.isDisabled as boolean} isInvalid={p.isInvalid as boolean}>
      <UiSearchField.Group>
        <UiSearchField.SearchIcon />
        <UiSearchField.Input placeholder="Search..." />
        <UiSearchField.ClearButton />
      </UiSearchField.Group>
    </UiSearchField>
  ),
};
