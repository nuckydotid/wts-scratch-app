import { BlockNavBar } from "../../../components/reusable-blocks";
import { TeleportProvider } from "../../../components/teleport";
import type { ComponentDef } from "./index";

export const BlockNavBarBlock: ComponentDef = {
  label: "BlockNavBar",
  category: "reusable blocks",
  controls: {
    title: { type: "text", default: "Log In" },
    showBack: { type: "boolean", default: true },
    isBusy: { type: "boolean", default: false },
  },
  render: (p) => (
    <TeleportProvider>
      <BlockNavBar
        menuA11yLabel="Menu"
        backA11yLabel="Back"
        moreActionsA11yLabel="More actions"

        title={p.title as string}
        showBack={Boolean(p.showBack)}
        isBusy={Boolean(p.isBusy)}
        menuItems={[
          { key: "edit", label: "Edit", onPress: () => {} },
          { key: "share", label: "Share", onPress: () => {} },
          { key: "delete", label: "Delete", danger: true, onPress: () => {} },
        ]}
      />
    </TeleportProvider>
  ),
};
