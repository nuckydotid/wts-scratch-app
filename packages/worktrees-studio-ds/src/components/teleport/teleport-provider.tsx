import { Z_OVERLAY } from "../../lib/z-index";
import { TOAST_DISMISS_MS } from "../../lib/timing";
import { DUR_MED, DUR_SLOW } from "../../lib/animation";
import { useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { Pressable, View, StyleSheet, Keyboard } from "react-native";
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { PortalProvider } from "react-native-teleport";
import { UiView, UiCloseButton } from "../heroui-primitive";
import {
  FullSheetContext,
  TeleportContext,
  type FullSheetHandle,
  type TeleportToastConfig,
  type OverlayLayout,
  TeleportMediaViewerConfig,
} from "./teleport-context";
import { TeleportToastView } from "./teleport-toast-view";
import { TeleportDrawerView, type TeleportDrawerConfig } from "./teleport-drawer-view";
import {
  TeleportTabBarView,
  TAB_BAR_TOTAL_HEIGHT,
  type TeleportTabBarConfig,
} from "./teleport-tab-bar-view";
import { useTheme } from "../../hooks/use-theme";
import { TeleportFullSheetView } from "./teleport-full-sheet-view";
import { TeleportMenuView, type TeleportMenuConfig } from "./teleport-menu-view";
import { TeleportMediaViewerView } from "./teleport-media-viewer-view";
import { useTeleportBackHandler, type TeleportOverlay } from "./use-teleport-back-handler";

// ── Types ────────────────────────────────────────────

interface TeleportToast {
  id: string;
  config: TeleportToastConfig;
}

let nextId = 0;
function genId() {
  return `teleport-${++nextId}`;
}

/** Breathing room between the toast band and the keyboard / tab bar. */
const TOAST_BOTTOM_GAP = 12;

// ── Bottom Sheet Group ────────────────────────────────

function BottomSheetGroup({
  children,
  onClose,
}: Readonly<{ children: ReactNode; onClose: () => void }>) {
  const insets = useSafeAreaInsets();
  const backdropOpacity = useSharedValue(0);
  const translateY = useSharedValue(400);

  useEffect(() => {
    backdropOpacity.value = 0.4;
    translateY.value = 0;
  }, [backdropOpacity, translateY]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: withTiming(backdropOpacity.value, { duration: DUR_MED }),
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(translateY.value, { duration: DUR_SLOW }) }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[{ ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.4)" }, backdropStyle]}
      >
        <Pressable onPress={onClose} style={{ flex: 1 }} />
      </Animated.View>
      <Animated.View style={[{ position: "absolute", left: 0, right: 0, bottom: 0 }, sheetStyle]}>
        <UiView
          className="bg-surface rounded-t-2xl shadow-overlay"
          style={{
            paddingTop: 16,
            paddingLeft: 16,
            paddingRight: 16,
            paddingBottom: insets.bottom + 16,
          }}
        >
          <UiView className="flex-row justify-end mb-2">
            <UiCloseButton testID="bottom-sheet-close" onPress={onClose} />
          </UiView>
          {children}
        </UiView>
      </Animated.View>
    </View>
  );
}

// ── Toast Item ───────────────────────────────────────

function ToastItem({ config }: Readonly<{ config: TeleportToastConfig }>) {
  const translateY = useSharedValue(120);

  useEffect(() => {
    translateY.value = 0;
  }, [translateY]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(translateY.value, { duration: DUR_SLOW }) }],
    marginTop: 8,
  }));

  return (
    <Animated.View style={style} pointerEvents="none">
      <TeleportToastView
        variant={config.variant}
        title={config.title}
        description={config.description}
        testID={config.testID}
      />
    </Animated.View>
  );
}

// ── Provider ─────────────────────────────────────────

export function TeleportProvider({ children }: Readonly<{ children: ReactNode }>) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [overlays, setOverlays] = useState<TeleportOverlay[]>([]);
  const [toasts, setToasts] = useState<TeleportToast[]>([]);
  const [tabBarConfig, setTabBarConfig] = useState<TeleportTabBarConfig | null>(null);
  const rootRef = useRef<View>(null);
  /** Extra bottom space the toast band must clear (visible tab bar). */
  const tabBarOffset = tabBarConfig ? TAB_BAR_TOTAL_HEIGHT : 0;

  const showBottomSheet = useCallback((content: ReactNode) => {
    // Bottom sheets never host text inputs (DS rule) — dismiss any keyboard
    // left over from the source screen so it cannot cover the sheet's actions
    // (date-picker confirm, destructive confirms) on either platform.
    Keyboard.dismiss();
    const id = genId();
    setOverlays((prev) => [...prev, { kind: "sheet", id, content }]);
    return id;
  }, []);

  const closeBottomSheet = useCallback((id: string) => {
    Keyboard.dismiss();
    setOverlays((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const closeFullSheet = useCallback((id: string) => {
    Keyboard.dismiss();
    setOverlays((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const stepBackFullSheet = useCallback((id: string): boolean => {
    let stepped = false;
    setOverlays((prev) =>
      prev.map((o) => {
        if (o.kind === "fullSheet" && o.id === id) {
          const sheetData = o.data as { activeStep?: number } | undefined;
          if (sheetData && typeof sheetData.activeStep === "number" && sheetData.activeStep > 0) {
            stepped = true;
            return {
              ...o,
              data: { ...sheetData, activeStep: sheetData.activeStep - 1 },
            };
          }
        }
        return o;
      })
    );
    return stepped;
  }, []);

  const showFullSheet = useCallback(
    (
      content: ReactNode,
      footer: ReactNode | undefined,
      options: {
        title: string;
        subtitle: string;
        stepsBar?: ReactNode;
        scrollable?: boolean;
      }
    ) => {
      const id = genId();
      setOverlays((prev) => [
        ...prev,
        {
          kind: "fullSheet",
          id,
          content,
          footer,
          title: options.title,
          subtitle: options.subtitle,
          stepsBar: options.stepsBar,
          scrollable: options.scrollable,
        },
      ]);
      const handle: FullSheetHandle = {
        id,
        close: () => closeFullSheet(id),
        update: (nextContent, nextFooter) => {
          setOverlays((prev) =>
            prev.map((o) =>
              o.kind === "fullSheet" && o.id === id
                ? {
                    ...o,
                    content: nextContent,
                    footer: nextFooter !== undefined ? nextFooter : o.footer,
                  }
                : o
            )
          );
        },
        setData: (data: unknown) => {
          setOverlays((prev) =>
            prev.map((o) => (o.kind === "fullSheet" && o.id === id ? { ...o, data } : o))
          );
        },
        goBackStep: () => stepBackFullSheet(id),
      };
      return handle;
    },
    [closeFullSheet, stepBackFullSheet]
  );

  const showMenu = useCallback((config: TeleportMenuConfig) => {
    const id = genId();
    setOverlays((prev) => [...prev, { kind: "menu", id, config }]);
    return id;
  }, []);

  const closeMenu = useCallback((id: string) => {
    setOverlays((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const measureInOverlay = useCallback(
    (view: View | null, callback: (layout: OverlayLayout) => void) => {
      const root = rootRef.current;
      if (!view || !root) return;
      view.measureInWindow((x1, y1, w, h) => {
        root.measureInWindow((x0, y0) => {
          callback({ x: x1 - x0, y: y1 - y0, width: w, height: h });
        });
      });
    },
    []
  );

  const showToast = useCallback((config: TeleportToastConfig) => {
    const id = genId();
    setToasts((prev) => {
      const next = [...prev, { id, config }];
      return next.slice(-3);
    });
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DISMISS_MS);
    return id;
  }, []);

  const closeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showDrawer = useCallback((config: TeleportDrawerConfig) => {
    const id = genId();
    // Single-drawer semantics, but still lands on TOP of the queue.
    setOverlays((prev) => [
      ...prev.filter((o) => o.kind !== "drawer"),
      { kind: "drawer", id, config },
    ]);
  }, []);

  const closeDrawer = useCallback(() => {
    setOverlays((prev) => prev.filter((o) => o.kind !== "drawer"));
  }, []);

  const showTabBar = useCallback((config: TeleportTabBarConfig) => {
    setTabBarConfig(config);
  }, []);

  const hideTabBar = useCallback(() => {
    setTabBarConfig(null);
  }, []);

  const showMediaViewer = useCallback((config: TeleportMediaViewerConfig) => {
    const id = genId();
    setOverlays((prev) => [...prev, { kind: "mediaViewer", id, config }]);
    return id;
  }, []);

  const closeMediaViewer = useCallback((id?: string) => {
    if (id) {
      setOverlays((prev) => prev.filter((o) => o.id !== id));
    } else {
      setOverlays((prev) => prev.filter((o) => o.kind !== "mediaViewer"));
    }
  }, []);

  useTeleportBackHandler({
    overlays,
    closeBottomSheet,
    closeFullSheet,
    stepBackFullSheet,
    closeDrawer,
    closeMenu,
    closeMediaViewer,
  });

  return (
    <TeleportContext
      value={{
        showBottomSheet,
        closeBottomSheet,
        showFullSheet,
        closeFullSheet,
        showMenu,
        closeMenu,
        showToast,
        closeToast,
        showDrawer,
        closeDrawer,
        showTabBar,
        hideTabBar,
        showMediaViewer,
        closeMediaViewer,
        measureInOverlay,
      }}
    >
      <PortalProvider>
        <View ref={rootRef} style={{ flex: 1, overflow: "hidden" }}>
          {children}
          {tabBarConfig && <TeleportTabBarView key={theme} config={tabBarConfig} />}
          {overlays.map((overlay) => {
            switch (overlay.kind) {
              case "drawer":
                return (
                  <TeleportDrawerView
                    key={overlay.id}
                    config={overlay.config}
                    onClose={closeDrawer}
                  />
                );
              case "sheet":
                return (
                  <BottomSheetGroup key={overlay.id} onClose={() => closeBottomSheet(overlay.id)}>
                    {overlay.content}
                  </BottomSheetGroup>
                );
              case "fullSheet": {
                const sheetData = overlay.data as { activeStep?: number } | undefined;
                const canStepBack =
                  typeof sheetData?.activeStep === "number" && sheetData.activeStep > 0;
                const goBackStep = () => {
                  if (canStepBack) {
                    return stepBackFullSheet(overlay.id);
                  }
                  closeFullSheet(overlay.id);
                  return false;
                };

                return (
                  <FullSheetContext
                    key={overlay.id}
                    value={{
                      data: overlay.data,
                      setData: (data: unknown) => {
                        setOverlays((prev) =>
                          prev.map((o) =>
                            o.kind === "fullSheet" && o.id === overlay.id ? { ...o, data } : o
                          )
                        );
                      },
                      close: () => closeFullSheet(overlay.id),
                      goBackStep,
                      canStepBack,
                    }}
                  >
                    <TeleportFullSheetView
                      content={overlay.content}
                      footer={overlay.footer}
                      title={overlay.title}
                      subtitle={overlay.subtitle}
                      stepsBar={overlay.stepsBar}
                      scrollable={overlay.scrollable ?? true}
                      onClose={() => closeFullSheet(overlay.id)}
                    />
                  </FullSheetContext>
                );
              }
              case "menu":
                return (
                  <TeleportMenuView
                    key={overlay.id}
                    config={overlay.config}
                    onClose={() => closeMenu(overlay.id)}
                  />
                );
              case "mediaViewer":
                return (
                  <TeleportMediaViewerView
                    key={overlay.id}
                    config={overlay.config}
                    onClose={() => {
                      overlay.config.onClose?.();
                      closeMediaViewer(overlay.id);
                    }}
                  />
                );
            }
          })}
          {toasts.length > 0 && (
            <View
              // Bottom-anchored band: sits above the tab bar + safe inset when
              // closed and floats just above the keyboard when it opens (so
              // feedback stays visible next to the input). Never accepts
              // touches, so it can never cover the navbar/tab controls.
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: Z_OVERLAY,
              }}
              pointerEvents="none"
            >
              <KeyboardStickyView
                // lift = keyboardHeight - opened; with the natural lift below
                // (tab bar + inset + gap) this resolves to exactly `gap` above
                // the keyboard top.
                offset={{ closed: 0, opened: insets.bottom + tabBarOffset }}
              >
                <View style={{ paddingBottom: insets.bottom + tabBarOffset + TOAST_BOTTOM_GAP }}>
                  {toasts.map((toast) => (
                    <ToastItem key={toast.id} config={toast.config} />
                  ))}
                </View>
              </KeyboardStickyView>
            </View>
          )}
        </View>
      </PortalProvider>
    </TeleportContext>
  );
}
