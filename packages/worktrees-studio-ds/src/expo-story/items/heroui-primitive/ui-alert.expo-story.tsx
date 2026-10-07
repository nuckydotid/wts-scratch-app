import type { ComponentDef } from "./index";
import { UiAlert } from "../../../components";
import * as C from "./controls";

export const UIAlert: ComponentDef = {
  label: "UIAlert",
  category: "heroui-primitive",
  controls: {
    status: C.select(C.COLORS_5_ALT, "accent"),
    title: C.txt("Alert title"),
    description: C.txt("Alert description text here."),
  },
  render: (p) => (
    <UiAlert status={p.status as any}>
      <UiAlert.Content>
        <UiAlert.Title>{p.title as string}</UiAlert.Title>
        <UiAlert.Description>{p.description as string}</UiAlert.Description>
      </UiAlert.Content>
    </UiAlert>
  ),
};
