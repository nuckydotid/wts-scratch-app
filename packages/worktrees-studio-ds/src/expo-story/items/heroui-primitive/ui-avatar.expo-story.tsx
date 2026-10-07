import type { ComponentDef } from "./index";
import { UiAvatar, UiView } from "../../../components";
import * as C from "./controls";

export const UIAvatar: ComponentDef = {
  label: "UIAvatar",
  category: "heroui-primitive",
  controls: {
    size: C.size,
    variant: C.select(C.VARIANTS_SOFT, "default"),
    color: C.select(C.COLORS_5_ALT, "accent"),
  },
  render: (p) => (
    <UiView className="flex-row gap-3">
      <UiAvatar size={p.size as any} variant={p.variant as any} color={p.color as any}>
        <UiAvatar.Fallback>JD</UiAvatar.Fallback>
      </UiAvatar>
      <UiAvatar size={p.size as any} variant={p.variant as any} color={p.color as any}>
        <UiAvatar.Fallback>AK</UiAvatar.Fallback>
      </UiAvatar>
      <UiAvatar size={p.size as any} variant={p.variant as any} color={p.color as any}>
        <UiAvatar.Fallback>SM</UiAvatar.Fallback>
      </UiAvatar>
    </UiView>
  ),
};
