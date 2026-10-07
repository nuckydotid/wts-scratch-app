import { BlockProfileHeader } from "../../../components/reusable-blocks";
import type { ComponentDef } from "./index";
import * as C from "../heroui-primitive/controls";

export const BlockProfileHeaderBlock: ComponentDef = {
  label: "BlockProfileHeader",
  category: "reusable blocks",
  controls: {
    name: C.txt("Sarah Johnson"),
    role: C.txt("teacher"),
    avatar: C.txt(""),
    isLoading: C.bool(false),
    isError: C.bool(false),
  },
  render: (p) => (
    <BlockProfileHeader
      retryLabel="Retry"
      retryTitle="Couldn't load"

      name={p.name as string}
      role={(p.role as string) || undefined}
      avatar={(p.avatar as string) || undefined}
      isLoading={Boolean(p.isLoading)}
      isError={Boolean(p.isError)}
    />
  ),
};
