import { UiView, UiText } from "../../../components";
import { TeleportTabBarView, type TeleportTabBarConfig } from "../../../components/teleport";
import type { ComponentDef } from "../heroui-primitive";
import * as C from "../heroui-primitive/controls";

const ASSET_BASE = "https://worker.example.com/api/assets";

const BASE_ITEMS: TeleportTabBarConfig["items"] = [
  {
    key: "home",
    icon: `${ASSET_BASE}/bottom-tab/home-icon.png`,
    label: "Home",
    testID: "tab-home",
  },
  {
    key: "gallery",
    icon: `${ASSET_BASE}/bottom-tab/camera-icon.png`,
    label: "Gallery",
    testID: "tab-gallery",
  },
  {
    key: "messages",
    icon: `${ASSET_BASE}/bottom-tab/messages-icon.png`,
    label: "Messages",
    testID: "tab-messages",
  },
  {
    key: "profile",
    icon: `${ASSET_BASE}/bottom-tab/profile-icon.png`,
    label: "Profile",
    testID: "tab-profile",
  },
];

export const TeleportTabBarBlock: ComponentDef = {
  label: "TeleportTabBar",
  category: "teleport",
  controls: {
    activeTab: C.select(["home", "gallery", "messages", "profile"], "home"),
    messagesBadge: C.select(["none", "3", "dot"], "none"),
    itemsCount: C.select(["4", "3"], "4"),
  },
  render: (p) => {
    const activeTab = p.activeTab as string;
    const messagesBadge = p.messagesBadge as string;
    const items = BASE_ITEMS.map((item) =>
      item.key === "messages"
        ? {
            ...item,
            ...(messagesBadge === "3"
              ? { badge: 3 }
              : messagesBadge === "dot"
                ? { dot: true }
                : {}),
          }
        : item
    ).slice(0, p.itemsCount === "3" ? 3 : 4);

    return (
      <UiView className="flex-1 bg-background">
        <UiView className="flex-1 items-center justify-center gap-2 p-6">
          <UiText className="text-sm text-muted text-center">
            Persistent bottom tab bar — active: {activeTab}
          </UiText>
        </UiView>
        <TeleportTabBarView
          config={{
            items,
            activeKey: activeTab,
            onPress: () => {},
          }}
        />
      </UiView>
    );
  },
};
