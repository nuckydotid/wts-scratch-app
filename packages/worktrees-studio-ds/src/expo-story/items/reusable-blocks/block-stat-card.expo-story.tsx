import { BlockStatCard } from "../../../components/reusable-blocks";
import type { ComponentDef } from "./index";
import type { IconName } from "../../../components/heroui-primitive";
import * as C from "../heroui-primitive/controls";

export const BlockStatCardBlock: ComponentDef = {
  label: "BlockStatCard",
  category: "reusable blocks",
  controls: {
    icon: C.txt("school-outline"),
    value: C.txt("12"),
    label: C.txt("Classes"),
    isLoading: C.bool(false),
    isError: C.bool(false),
  },
  render: (p) => (
    <BlockStatCard
      retryLabel="Retry"
      retryTitle="Couldn't load"

      icon={p.icon as IconName}
      value={Number(p.value) || 0}
      label={p.label as string}
      isLoading={Boolean(p.isLoading)}
      isError={Boolean(p.isError)}
    />
  ),
};
