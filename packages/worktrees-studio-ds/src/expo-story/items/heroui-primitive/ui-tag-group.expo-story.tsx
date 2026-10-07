import type { ComponentDef } from "./index";
import { UiTagGroup } from "../../../components";
import * as C from "./controls";

export const UITagGroup: ComponentDef = {
  label: "UITagGroup",
  category: "heroui-primitive",
  controls: {
    size: C.size,
    variant: C.defaultSurface,
    selectionMode: C.select(C.SELECTION_ALL, "none"),
  },
  render: (p) => (
    <UiTagGroup
      size={p.size as any}
      variant={p.variant as any}
      selectionMode={p.selectionMode as any}
    >
      <UiTagGroup.List>
        <UiTagGroup.Item id="1">
          <UiTagGroup.ItemLabel>Tag 1</UiTagGroup.ItemLabel>
        </UiTagGroup.Item>
        <UiTagGroup.Item id="2">
          <UiTagGroup.ItemLabel>Tag 2</UiTagGroup.ItemLabel>
        </UiTagGroup.Item>
        <UiTagGroup.Item id="3">
          <UiTagGroup.ItemLabel>Tag 3</UiTagGroup.ItemLabel>
        </UiTagGroup.Item>
      </UiTagGroup.List>
    </UiTagGroup>
  ),
};
