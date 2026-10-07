import type { ComponentDef } from "./index";
import { UiSlider, UiView } from "../../../components";
import * as C from "./controls";

export const UISlider: ComponentDef = {
  label: "UISlider",
  category: "heroui-primitive",
  controls: {
    orientation: C.orientation,
    isDisabled: C.isDisabled,
    minValue: C.txt("0"),
    maxValue: C.txt("100"),
    step: C.txt("1"),
  },
  render: (p) => (
    <UiView className={`w-full ${p.orientation === "vertical" ? "h-40 items-center" : ""}`}>
      <UiSlider
        orientation={p.orientation as any}
        isDisabled={p.isDisabled as boolean}
        minValue={Number(p.minValue)}
        maxValue={Number(p.maxValue)}
        step={Number(p.step)}
      >
        <UiSlider.Track>
          <UiSlider.Fill />
          <UiSlider.Thumb />
        </UiSlider.Track>
      </UiSlider>
    </UiView>
  ),
};
