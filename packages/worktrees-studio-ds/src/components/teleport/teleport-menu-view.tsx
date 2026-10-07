import { DUR_FAST } from "../../lib/animation";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from "react-native-reanimated";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import { UiView, UiText, UiPressable, UiIcon, type IconName } from "../heroui-primitive";

export type TeleportMenuItem = {
  key: string;
  label: string;
  subtitle?: string;
  icon?: IconName;
  danger?: boolean;
  onPress?: () => void;
  testID?: string;
};

export type TeleportMenuConfig = {
  x: number;
  y: number;
  width?: number;
  items: TeleportMenuItem[];
};

type Props = {
  config: TeleportMenuConfig;
  onClose: () => void;
};

const MENU_GAP = 6;
const MENU_PADDING = 4;
/** Shared menu panel width — navbar and card menus render identically. */
export const MENU_WIDTH = 260;
/** Estimated height of one menu row (icon + title, ~py-3 + text-base; a
 * subtitle row is slightly taller) — used until onLayout measures the panel. */
const ROW_ESTIMATE = 56;

function itemRounding(index: number, count: number): string {
  if (count === 1) return "rounded-2xl";
  if (index === 0) return "rounded-t-2xl";
  if (index === count - 1) return "rounded-b-2xl";
  return "";
}

export function TeleportMenuView({ config, onClose }: Props) {
  const { width: frameWidth, height: frameHeight } = useSafeAreaFrame();
  const menuWidth = Math.min(config.width ?? MENU_WIDTH, frameWidth - 8);
  const menuX = Math.max(4, Math.min(config.x, frameWidth - menuWidth - 4));
  // Rendered below the trigger unless the panel would overflow the bottom of
  // the frame — then it flips above the trigger (see the onLayout measure).
  const [panelHeight, setPanelHeight] = useState<number | null>(null);
  const estimatedHeight = config.items.length * ROW_ESTIMATE + MENU_PADDING * 2;
  const effectiveHeight = panelHeight ?? estimatedHeight;
  const fitsBelow = config.y + MENU_GAP + effectiveHeight <= frameHeight - 4;
  const menuY = fitsBelow
    ? config.y + MENU_GAP
    : Math.max(4, config.y - effectiveHeight - MENU_GAP);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(4);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = 1;
    translateY.value = 0;
    backdropOpacity.value = 1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const panelStyle = useAnimatedStyle(() => ({
    opacity: withTiming(opacity.value, { duration: DUR_FAST }),
    transform: [{ translateY: withTiming(translateY.value, { duration: DUR_FAST }) }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: withTiming(backdropOpacity.value * 0.15, { duration: DUR_FAST }),
  }));

  return (
    <>
      <Animated.View
        style={[{ ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,1)" }, backdropStyle]}
        pointerEvents="auto"
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>
      <Animated.View
        testID="teleport-menu-panel"
        onLayout={(e) => setPanelHeight(e.nativeEvent.layout.height)}
        style={[
          {
            position: "absolute",
            top: menuY,
            left: menuX,
            width: menuWidth,
          },
          panelStyle,
        ]}
        pointerEvents="auto"
      >
        <UiView className="bg-surface rounded-2xl shadow-overlay overflow-hidden">
          <UiView className="p-1">
            {config.items.map((item, index) => (
              <UiPressable
                key={item.key}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                testID={item.testID}
                onPress={() => {
                  item.onPress?.();
                  onClose();
                }}
                className={`flex-row items-center px-3 py-2.5 gap-3 ${itemRounding(
                  index,
                  config.items.length
                )}`}
              >
                {item.icon ? (
                  <UiView
                    className={`w-9 h-9 rounded-full items-center justify-center ${
                      item.danger ? "bg-danger/10" : "bg-accent/10"
                    }`}
                  >
                    <UiIcon
                      name={item.icon}
                      size={18}
                      className={item.danger ? "text-danger" : "text-accent"}
                    />
                  </UiView>
                ) : null}
                <UiView className="flex-1 min-w-0">
                  <UiText
                    className={`text-base font-semibold ${
                      item.danger ? "text-danger" : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </UiText>
                  {item.subtitle ? (
                    <UiText className="text-xs text-muted">{item.subtitle}</UiText>
                  ) : null}
                </UiView>
              </UiPressable>
            ))}
          </UiView>
        </UiView>
      </Animated.View>
    </>
  );
}
