import { useCallback } from "react";
import type { ReactNode } from "react";
import { useBackHandler } from "../../hooks/use-back-handler";
import type { TeleportDrawerConfig } from "./teleport-drawer-view";
import type { TeleportMenuConfig } from "./teleport-menu-view";
import type { TeleportMediaViewerConfig } from "./teleport-context";

export type TeleportOverlay =
  | { kind: "drawer"; id: string; config: TeleportDrawerConfig }
  | { kind: "sheet"; id: string; content: ReactNode }
  | {
      kind: "fullSheet";
      id: string;
      content: ReactNode;
      footer?: ReactNode;
      title: string;
      subtitle: string;
      stepsBar?: ReactNode;
      data?: unknown;
      scrollable?: boolean;
    }
  | { kind: "menu"; id: string; config: TeleportMenuConfig }
  | { kind: "mediaViewer"; id: string; config: TeleportMediaViewerConfig };

export interface UseTeleportBackHandlerOptions {
  overlays: readonly TeleportOverlay[];
  closeBottomSheet: (id: string) => void;
  closeFullSheet: (id: string) => void;
  stepBackFullSheet: (id: string) => boolean;
  closeDrawer: () => void;
  closeMenu: (id: string) => void;
  closeMediaViewer: (id?: string) => void;
}

export function useTeleportBackHandler({
  overlays,
  closeBottomSheet,
  closeFullSheet,
  stepBackFullSheet,
  closeDrawer,
  closeMenu,
  closeMediaViewer,
}: Readonly<UseTeleportBackHandlerOptions>) {
  const handleBack = useCallback(() => {
    if (overlays.length === 0) return false;

    const top = overlays.at(-1);
    if (!top) return false;

    switch (top.kind) {
      case "fullSheet": {
        const sheetData = top.data as { activeStep?: number } | undefined;
        if (sheetData && typeof sheetData.activeStep === "number" && sheetData.activeStep > 0) {
          stepBackFullSheet(top.id);
        } else {
          closeFullSheet(top.id);
        }
        return true;
      }
      case "sheet": {
        closeBottomSheet(top.id);
        return true;
      }
      case "drawer": {
        closeDrawer();
        return true;
      }
      case "menu": {
        closeMenu(top.id);
        return true;
      }
      case "mediaViewer": {
        closeMediaViewer(top.id);
        return true;
      }
      default:
        return false;
    }
  }, [
    overlays,
    closeBottomSheet,
    closeFullSheet,
    stepBackFullSheet,
    closeDrawer,
    closeMenu,
    closeMediaViewer,
  ]);

  useBackHandler(handleBack);
}
