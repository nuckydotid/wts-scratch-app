import type { ComponentDef } from "./index";
import { UiSeparator, UiView, UiText } from "../../../components";
import * as C from "./controls";

export const UISeparator: ComponentDef = {
  label: "UISeparator",
  category: "heroui-primitive",
  controls: {
    variant: C.select(C.VARIANTS_THIN, "thin"),
    orientation: C.orientation,
  },
  render: (p) => (
    <UiView className="w-full">
      <UiText className="text-sm text-foreground mb-2">Content above</UiText>
      <UiSeparator variant={p.variant as any} orientation={p.orientation as any} />
      <UiText className="text-sm text-foreground mt-2">Content below</UiText>
    </UiView>
  ),
};
