import type { ComponentDef } from "./index";
import { UiChip, UiView } from "../../../components";
import * as C from "./controls";

export const UIChip: ComponentDef = {
  label: "UIChip",
  category: "heroui-primitive",
  controls: {
    size: C.size,
    variant: C.select(C.VARIANTS_PSTT_SOFT, "primary"),
    color: C.select(C.COLORS_5, "accent"),
    label: C.txt("Chip label"),
  },
  render: (p) => (
    <UiView className="flex-row gap-2">
      <UiChip size={p.size as any} variant={p.variant as any} color={p.color as any}>
        <UiChip.Label>{p.label as string}</UiChip.Label>
      </UiChip>
    </UiView>
  ),
};
