import { DUR_SLOW } from "../../lib/animation";
import { OVERLAY_SCRIM } from "../../lib/brand-colors";
import { useSheetSlide } from "../../hooks/use-sheet-slide";
import { View, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets, useSafeAreaFrame } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";
import {
  UiView,
  UiText,
  UiPressable,
  UiScrollView,
  UiIcon,
  type IconName,
} from "../heroui-primitive";

export type DrawerItem = {
  key: string;
  label: string;
  icon: IconName;
  badge?: number;
  onPress?: () => void;
  testID?: string;
};

export type TeleportDrawerConfig = {
  items: DrawerItem[];
  userName?: string;
  userEmail?: string;
};

type DrawerViewProps = {
  config: TeleportDrawerConfig;
  onClose: () => void;
};

const DRAWER_WIDTH_RATIO = 0.8;
const DRAWER_MAX_WIDTH = 300;

export function TeleportDrawerView({ config, onClose }: DrawerViewProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useSafeAreaFrame();
  const drawerWidth = Math.min(windowWidth * DRAWER_WIDTH_RATIO, DRAWER_MAX_WIDTH);
  const { translateX, close } = useSheetSlide(-drawerWidth, onClose);

  const [backgroundColor] = useCSSVariable(["--color-surface"]) as string[];

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: withTiming(translateX.value / drawerWidth + 1, { duration: DUR_SLOW }),
  }));

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(translateX.value, { duration: DUR_SLOW }) }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[{ ...StyleSheet.absoluteFill, backgroundColor: OVERLAY_SCRIM }, backdropStyle]}
      >
        <UiPressable onPress={close} className="flex-1" />
      </Animated.View>

      <Animated.View
        className="shadow-overlay"
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: drawerWidth,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            backgroundColor,
          },
          drawerStyle,
        ]}
      >
        <UiView className="flex-1">
          <UiView className="px-4 pb-4">
            <UiView className="flex-row items-center justify-between">
              <UiText className="font-semibold text-base text-foreground">
                {config.userName ?? "User"}
              </UiText>
              <UiPressable onPress={close} className="p-2">
                <UiIcon name="close" size={24} className="text-foreground" />
              </UiPressable>
            </UiView>
            {config.userEmail ? (
              <UiText className="text-xs text-muted mt-1">{config.userEmail}</UiText>
            ) : null}
          </UiView>

          <UiScrollView className="flex-1" contentContainerStyle={{ paddingTop: 8 }}>
            {config.items.map((item) => (
              <UiPressable
                key={item.key}
                testID={item.testID}
                onPress={() => {
                  item.onPress?.();
                  close();
                }}
                className="flex-row items-center px-4 py-3 gap-3"
              >
                <UiIcon name={item.icon} size={24} className="text-foreground" />
                <UiText className="text-[15px] text-foreground flex-1">{item.label}</UiText>
                {item.badge != null && item.badge > 0 && (
                  <UiView className="bg-accent rounded-full min-w-[20px] h-5 items-center justify-center px-1.5">
                    <UiText className="text-xs font-bold text-white">{item.badge}</UiText>
                  </UiView>
                )}
              </UiPressable>
            ))}
          </UiScrollView>
        </UiView>
      </Animated.View>
    </View>
  );
}
