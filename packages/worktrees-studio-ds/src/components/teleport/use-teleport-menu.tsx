import { useCallback } from "react";
import type { View } from "react-native";
import { useTeleport, type OverlayLayout } from "./teleport-context";
import { MENU_WIDTH, type TeleportMenuItem } from "./teleport-menu-view";

const MENU_GAP = 6;

export function useTeleportMenu() {
  const { showMenu, closeMenu, measureInOverlay } = useTeleport();

  const open = useCallback(
    (
      triggerRef: { current: View | null },
      items: TeleportMenuItem[],
      options?: { width?: number; align?: "left" | "right" }
    ) => {
      measureInOverlay(triggerRef.current, (layout: OverlayLayout) => {
        const menuWidth = options?.width ?? MENU_WIDTH;
        const x = options?.align === "left" ? layout.x : layout.x + layout.width - menuWidth;
        const id = showMenu({
          x,
          y: layout.y + layout.height + MENU_GAP,
          width: menuWidth,
          items,
        });
        return id;
      });
    },
    [measureInOverlay, showMenu]
  );

  return { open, closeMenu };
}
