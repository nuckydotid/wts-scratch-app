import { BlockRetry } from "../../../components/reusable-blocks";
import type { ComponentDef } from "./index";
import * as C from "../heroui-primitive/controls";

export const BlockRetryBlock: ComponentDef = {
  label: "BlockRetry",
  category: "reusable blocks",
  controls: {
    label: C.txt("Try again"),
  },
  render: (p) => <BlockRetry title={p.title as string} label={p.label as string} />,
};
