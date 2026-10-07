import { BlockSocialAuth } from "../../../components/reusable-blocks";
import type { ComponentDef } from "./index";
import * as C from "../heroui-primitive/controls";

export const BlockSocialAuthBlock: ComponentDef = {
  label: "BlockSocialAuth",
  category: "reusable blocks",
  controls: {
    showDivider: C.bool(true),
    showGoogle: C.bool(true),
  },
  render: (p) => (
    <BlockSocialAuth
      dividerLabel="or"
      googleLabel="Continue with Google"
      showDivider={Boolean(p.showDivider)}
      showGoogle={Boolean(p.showGoogle)}
    />
  ),
};
