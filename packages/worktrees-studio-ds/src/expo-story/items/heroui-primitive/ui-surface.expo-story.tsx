import type { ComponentDef } from "./index";
import { UiSurface, UiView, UiText } from "../../../components";
import * as C from "./controls";

export const UISurface: ComponentDef = {
  label: "UISurface",
  category: "heroui-primitive",
  controls: {
    variant: C.defaultTertiary,
  },
  render: (p) => (
    <UiView className="w-full">
      <UiSurface variant={p.variant as any} className="p-4 rounded-xl">
        <UiText className="text-foreground">Surface content</UiText>
      </UiSurface>
    </UiView>
  ),
};
