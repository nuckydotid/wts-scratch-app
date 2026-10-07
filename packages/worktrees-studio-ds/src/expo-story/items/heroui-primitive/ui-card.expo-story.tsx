import type { ComponentDef } from "./index";
import { UiCard, UiButton, UiText, UiView } from "../../../components";
import * as C from "./controls";

export const UICard: ComponentDef = {
  label: "UICard",
  category: "heroui-primitive",
  controls: {
    variant: C.defaultTertiary,
    title: C.txt("Card Title"),
    description: C.txt("Card description text."),
  },
  render: (p) => (
    <UiView className="w-full">
      <UiCard variant={p.variant as any}>
        <UiCard.Header>
          <UiCard.Title>{p.title as string}</UiCard.Title>
          <UiCard.Description>{p.description as string}</UiCard.Description>
        </UiCard.Header>
        <UiCard.Body>
          <UiText className="text-foreground">Main card content goes here.</UiText>
        </UiCard.Body>
        <UiCard.Footer>
          <UiButton variant="primary" size="sm">
            Action
          </UiButton>
        </UiCard.Footer>
      </UiCard>
    </UiView>
  ),
};
