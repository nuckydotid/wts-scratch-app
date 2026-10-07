import { createContext, useContext, type ReactNode } from "react";
import type { View } from "react-native";
import type { TeleportToastVariant } from "./teleport-toast-view";
import type { TeleportDrawerConfig } from "./teleport-drawer-view";
import type { TeleportMenuConfig } from "./teleport-menu-view";
import type { TeleportTabBarConfig } from "./teleport-tab-bar-view";

export interface TeleportToastConfig {
  variant?: TeleportToastVariant;
  title: string;
  description?: string;
  /** E2E hook — defaults to the generic `toast` testID. */
  testID?: string;
}

export interface OverlayLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Handle returned by `showFullSheet` — the one API for every fullsheet:
 * `close()` dismisses it, `update()` swaps content/footer in place (loading →
 * loaded), `setData()` publishes state the footer can consume.
 */
export interface FullSheetHandle {
  id: string;
  close: () => void;
  update: (content: ReactNode, footer?: ReactNode) => void;
  setData: (data: unknown) => void;
  goBackStep?: () => boolean;
}

/** Per-fullsheet context: content publishes with `setData`, footer consumes. */
export interface FullSheetContextValue {
  data: unknown;
  setData: (data: unknown) => void;
  close: () => void;
  goBackStep?: () => boolean;
  canStepBack?: boolean;
}

export const FullSheetContext = createContext<FullSheetContextValue | null>(null);

/** Null-safe variant for content that may render outside a fullsheet. */
export function useOptionalFullSheet(): FullSheetContextValue | null {
  return useContext(FullSheetContext);
}

/** Reads the opened fullsheet's data store + controls (throws outside one). */
export function useFullSheet<T = unknown>(): {
  data: T | undefined;
  setData: (data: T) => void;
  close: () => void;
  goBackStep: () => boolean;
  canStepBack: boolean;
} {
  const ctx = useContext(FullSheetContext);
  if (!ctx) {
    throw new Error("useFullSheet must be used inside a fullsheet (content or footer).");
  }
  return {
    data: ctx.data as T | undefined,
    setData: ctx.setData as (data: T) => void,
    close: ctx.close,
    goBackStep: ctx.goBackStep ?? (() => false),
    canStepBack: ctx.canStepBack ?? false,
  };
}

export interface TeleportMediaViewerConfig {
  uri: string;
  mediaType?: "image" | "video";
  title?: string;
  caption?: string;
  onClose?: () => void;
  testID?: string;
  closeA11yLabel?: string;
}

export interface TeleportContextType {
  showBottomSheet: (content: ReactNode) => string;
  closeBottomSheet: (id: string) => void;
  showFullSheet: (
    content: ReactNode,
    footer: ReactNode | undefined,
    /**
     * Fullsheet header is MANDATORY: `title` + `subtitle` always render in the
     * pinned chrome (i18n-sourced at the call site).
     */
    options: {
      title: string;
      subtitle: string;
      stepsBar?: ReactNode;
      scrollable?: boolean;
    }
  ) => FullSheetHandle;
  closeFullSheet: (id: string) => void;
  showMenu: (config: TeleportMenuConfig) => string;
  closeMenu: (id: string) => void;
  showToast: (config: TeleportToastConfig) => string;
  closeToast: (id: string) => void;
  showDrawer: (config: TeleportDrawerConfig) => void;
  closeDrawer: () => void;
  showTabBar: (config: TeleportTabBarConfig) => void;
  hideTabBar: () => void;
  showMediaViewer: (config: TeleportMediaViewerConfig) => string;
  closeMediaViewer: (id?: string) => void;
  /** Measures a view relative to the teleport overlay layer (provider root). */
  measureInOverlay: (view: View | null, callback: (layout: OverlayLayout) => void) => void;
}

export const TeleportContext = createContext<TeleportContextType | null>(null);

export function useTeleport(): TeleportContextType {
  const ctx = useContext(TeleportContext);
  if (!ctx) throw new Error("useTeleport must be used within TeleportProvider");
  return ctx;
}
