import { BlockEmptyState } from "../../../components/reusable-blocks";
import type { ComponentDef } from "./index";
import * as C from "../heroui-primitive/controls";
export const BlockEmptyStateBlock: ComponentDef = {
  label: "BlockEmptyState",
  category: "reusable blocks",
  controls: {
    title: C.txt("No items found"),
    subtitle: C.txt("Add new items to get started"),
  },
  render: (p) => <BlockEmptyState title={p.title as string} subtitle={p.subtitle as string} />,
};
