import type { ComponentDef } from "./index";
import { UiTabs, UiText, UiView } from "../../../components";
import { useState, type ReactNode } from "react";
import * as C from "./controls";

function TabsContent({ variant }: { variant: string }): ReactNode {
  const [value, setValue] = useState("1");
  return (
    <UiView className="w-full">
      <UiTabs value={value} variant={variant as any} onValueChange={setValue}>
        <UiTabs.List>
          <UiTabs.Trigger value="1">
            <UiTabs.Label>Tab 1</UiTabs.Label>
          </UiTabs.Trigger>
          <UiTabs.Trigger value="2">
            <UiTabs.Label>Tab 2</UiTabs.Label>
          </UiTabs.Trigger>
          <UiTabs.Indicator />
        </UiTabs.List>
        <UiTabs.Content value="1">
          <UiText className="text-foreground p-4">Content 1</UiText>
        </UiTabs.Content>
        <UiTabs.Content value="2">
          <UiText className="text-foreground p-4">Content 2</UiText>
        </UiTabs.Content>
      </UiTabs>
    </UiView>
  );
}

export const UITabs: ComponentDef = {
  label: "UITabs",
  category: "heroui-primitive",
  controls: {
    variant: C.primarySecondary,
  },
  render: (p) => <TabsContent variant={p.variant as string} />,
};
