import { useCallback, useRef, useState } from "react";
import type { View } from "react-native";
import { UiView, UiText, UiPressable } from "../../../components";
import { TeleportProvider, useTeleportMenu } from "../../../components/teleport";
import type { ComponentDef } from "./index";

function MenuDemo() {
  const menu = useTeleportMenu();
  const triggerRef = useRef<View>(null);
  const [picked, setPicked] = useState<string | null>(null);

  const openMenu = useCallback(() => {
    menu.open(triggerRef, [
      { key: "edit", label: "Edit", onPress: () => setPicked("Edit") },
      { key: "share", label: "Share", onPress: () => setPicked("Share") },
      { key: "delete", label: "Delete", danger: true, onPress: () => setPicked("Delete") },
    ]);
  }, [menu]);

  return (
    <UiView className="flex-1 items-center p-6 gap-4">
      <UiView className="flex-row justify-end w-full">
        <UiPressable ref={triggerRef} accessibilityRole="button" onPress={openMenu} className="p-1">
          <UiText className="text-2xl text-foreground">⋮</UiText>
        </UiPressable>
      </UiView>
      <UiText className="text-lg font-bold text-foreground">TeleportMenu</UiText>
      <UiText className="text-sm text-muted text-center">
        {picked ? `Picked: ${picked}` : "Tap the three-dot icon"}
      </UiText>
    </UiView>
  );
}

export const TeleportMenu: ComponentDef = {
  label: "TeleportMenu",
  category: "teleport",
  controls: {},
  render: () => (
    <TeleportProvider>
      <MenuDemo />
    </TeleportProvider>
  ),
};
