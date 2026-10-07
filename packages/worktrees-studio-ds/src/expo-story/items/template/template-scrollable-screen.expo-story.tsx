import { TemplateScrollableScreen } from "../../../components/template";
import { UiView, UiText } from "../../../components";
import type { ComponentDef } from "./index";

export const TemplateScrollableScreenBlock: ComponentDef = {
  label: "TemplateScrollableScreen",
  category: "templates",
  controls: {},
  render: () => (
    <TemplateScrollableScreen
      header={
        <UiView className="h-10 bg-accent/10 items-center justify-center">
          <UiText className="text-sm text-accent">Header slot</UiText>
        </UiView>
      }
      footer={<UiText className="text-xs text-muted text-center px-5 pb-4">Footer slot</UiText>}
    >
      <UiView className="h-40 bg-surface rounded-xl items-center justify-center">
        <UiText className="text-muted">Scrollable content area</UiText>
      </UiView>
    </TemplateScrollableScreen>
  ),
};
