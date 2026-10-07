import type { ComponentDef } from "./index";
import { UiAccordion, UiText, UiView } from "../../../components";
import * as C from "./controls";

export const UIAccordion: ComponentDef = {
  label: "UIAccordion",
  category: "heroui-primitive",
  controls: {
    selectionMode: C.select(C.SELECTION_SINGLE, "single"),
    variant: C.defaultSurface,
    isDisabled: C.isDisabled,
    isCollapsible: C.isCollapsible,
  },
  render: (p) => (
    <UiView className="w-full">
      <UiAccordion
        selectionMode={p.selectionMode as any}
        variant={p.variant as any}
        isDisabled={p.isDisabled as boolean}
        isCollapsible={p.isCollapsible as boolean}
      >
        <UiAccordion.Item value="1">
          <UiAccordion.Trigger>
            <UiText className="text-foreground flex-1">Item 1</UiText>
            <UiAccordion.Indicator />
          </UiAccordion.Trigger>
          <UiAccordion.Content>
            <UiText className="text-muted px-6 py-2">Content 1</UiText>
          </UiAccordion.Content>
        </UiAccordion.Item>
        <UiAccordion.Item value="2">
          <UiAccordion.Trigger>
            <UiText className="text-foreground flex-1">Item 2</UiText>
            <UiAccordion.Indicator />
          </UiAccordion.Trigger>
          <UiAccordion.Content>
            <UiText className="text-muted px-6 py-2">Content 2</UiText>
          </UiAccordion.Content>
        </UiAccordion.Item>
      </UiAccordion>
    </UiView>
  ),
};
