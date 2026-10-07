import type { ComponentDef } from "./index";
import { UiLinkButton } from "../../../components";
import * as C from "./controls";

export const UILinkButton: ComponentDef = {
  label: "UILinkButton",
  category: "heroui-primitive",
  controls: {
    size: C.size,
    children: C.txt("Learn more"),
  },
  render: (p) => <UiLinkButton size={p.size as any}>{p.children as string}</UiLinkButton>,
};
