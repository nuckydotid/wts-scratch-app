import type { ComponentDef } from "./index";
import { UiRadioGroup, UiRadio, UiText } from "../../../components";
import * as C from "./controls";

export const UIRadioGroup: ComponentDef = {
  label: "UIRadioGroup",
  category: "heroui-primitive",
  controls: {
    variant: C.primarySecondary,
    isDisabled: C.isDisabled,
  },
  render: (p) => (
    <UiRadioGroup
      value="a"
      onValueChange={() => {}}
      variant={p.variant as any}
      isDisabled={p.isDisabled as boolean}
    >
      <UiRadioGroup.Item value="a">
        <UiRadio>
          <UiRadio.Indicator />
          <UiText className="text-foreground">Option A</UiText>
        </UiRadio>
      </UiRadioGroup.Item>
      <UiRadioGroup.Item value="b">
        <UiRadio>
          <UiRadio.Indicator />
          <UiText className="text-foreground">Option B</UiText>
        </UiRadio>
      </UiRadioGroup.Item>
      <UiRadioGroup.Item value="c">
        <UiRadio>
          <UiRadio.Indicator />
          <UiText className="text-foreground">Option C</UiText>
        </UiRadio>
      </UiRadioGroup.Item>
    </UiRadioGroup>
  ),
};
