import type { ComponentDef } from "./index";
import { UiSpinner } from "../../../components";
import * as C from "./controls";

export const UISpinner: ComponentDef = {
  label: "UISpinner",
  category: "heroui-primitive",
  controls: {
    size: C.size,
    color: C.select(C.COLORS_4, "default"),
    isLoading: C.isLoading,
  },
  render: (p) => (
    <UiSpinner size={p.size as any} color={p.color as any} isLoading={p.isLoading as boolean} />
  ),
};
