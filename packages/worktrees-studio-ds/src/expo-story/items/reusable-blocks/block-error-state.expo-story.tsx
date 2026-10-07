import { BlockErrorState } from "../../../components/reusable-blocks";
import type { ComponentDef } from "./index";
import type { IconName } from "../../../components/heroui-primitive";
import * as C from "../heroui-primitive/controls";
export const BlockErrorStateBlock: ComponentDef = {
  label: "BlockErrorState",
  category: "reusable blocks",
  controls: {
    icon: C.txt("alert-circle-outline"),
    title: C.txt("Something went wrong"),
    subtitle: C.txt("Failed to load. Please try again."),
  },
  render: (p) => (
    <BlockErrorState
      retryLabel="Retry"
      secondaryLabel="Log out"

      icon={p.icon as IconName}
      title={p.title as string}
      subtitle={p.subtitle as string}
    />
  ),
};
