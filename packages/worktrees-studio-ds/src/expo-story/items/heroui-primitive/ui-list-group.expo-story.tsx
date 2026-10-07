import type { ComponentDef } from "./index";
import { UiIcon, UiListGroup, UiView } from "../../../components";
import * as C from "./controls";

export const UIListGroup: ComponentDef = {
  label: "UIListGroup",
  category: "heroui-primitive",
  controls: {
    variant: C.defaultTertiary,
  },
  render: (p) => (
    <UiView className="w-full">
      <UiListGroup variant={p.variant as any}>
        <UiListGroup.Item>
          <UiListGroup.ItemPrefix>
            <UiIcon name="settings-outline" size={20} className="text-foreground" />
          </UiListGroup.ItemPrefix>
          <UiListGroup.ItemContent>
            <UiListGroup.ItemTitle>Item 1</UiListGroup.ItemTitle>
            <UiListGroup.ItemDescription>Description</UiListGroup.ItemDescription>
          </UiListGroup.ItemContent>
        </UiListGroup.Item>
        <UiListGroup.Item>
          <UiListGroup.ItemPrefix>
            <UiIcon name="person-outline" size={20} className="text-foreground" />
          </UiListGroup.ItemPrefix>
          <UiListGroup.ItemContent>
            <UiListGroup.ItemTitle>Item 2</UiListGroup.ItemTitle>
            <UiListGroup.ItemDescription>Description</UiListGroup.ItemDescription>
          </UiListGroup.ItemContent>
        </UiListGroup.Item>
      </UiListGroup>
    </UiView>
  ),
};
