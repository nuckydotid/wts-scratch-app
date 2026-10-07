import type { ComponentDef } from "./index";
import { UiText, UiView } from "../../../components";
import * as C from "./controls";

export const UIText: ComponentDef = {
  label: "UIText",
  category: "heroui-primitive",
  controls: {
    type: C.select(C.TEXT_TYPES, "body"),
    align: C.select(C.TEXT_ALIGNS, "start"),
    color: C.select(C.COLORS_TEXT, "default"),
    weight: C.select(C.TEXT_WEIGHTS, "normal"),
    truncate: C.truncate,
  },
  render: (p) => (
    <UiView className="w-full">
      <UiText
        type={p.type as any}
        align={p.align as any}
        color={p.color as any}
        weight={p.weight as any}
        truncate={p.truncate as boolean}
      >
        The quick brown fox jumps over the lazy dog.
      </UiText>
    </UiView>
  ),
};
