import type { ComponentDef } from "./index";
import { UiButton } from "../../../components";
import * as C from "./controls";

export const UIButton: ComponentDef = {
  label: "UIButton",
  category: "heroui-primitive",
  controls: {
    variant: C.select(
      ["primary", "secondary", "tertiary", "outline", "ghost", "danger", "danger-soft"],
      "primary"
    ),
    size: C.size,
    isDisabled: C.isDisabled,
    feedbackVariant: C.select(C.FEEDBACK_VARIANTS, "scale-highlight"),
    children: C.txt("Click me"),
  },
  render: (p) => (
    <UiButton
      variant={p.variant as any}
      size={p.size as any}
      isDisabled={p.isDisabled as boolean}
      feedbackVariant={p.feedbackVariant as any}
    >
      {p.children as string}
    </UiButton>
  ),
};
