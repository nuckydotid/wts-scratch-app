import { DUR_SLOW } from "../../lib/animation";
import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UiPressable, UiText, UiView } from "../heroui-primitive";

/** Icon + label row height (excludes top padding and bottom safe inset). */
export const TAB_BAR_BASE_HEIGHT = 56;
/** Vertical padding above (14) and below (16) the row. */
export const TAB_BAR_VERTICAL_PADDING = 30;
/** Total visual footprint above the bottom safe inset (row + padding). */
export const TAB_BAR_TOTAL_HEIGHT = TAB_BAR_BASE_HEIGHT + TAB_BAR_VERTICAL_PADDING;

export type TeleportTabBarItem = {
  key: string;
  icon: string;
  label: string;
  /** Count pill shown when > 0 (wins over `dot`). */
  badge?: number;
  /** Small unread dot when the count is unknown. */
  dot?: boolean;
  testID?: string;
};

export type TeleportTabBarConfig = {
  items: TeleportTabBarItem[];
  activeKey: string;
  onPress: (key: string) => void;
};

type TabBarViewProps = {
  config: TeleportTabBarConfig;
};

/**
 * Persistent bottom tab bar rendered by the teleport layer. The active key
 * and navigation callbacks are provided by the app (router-agnostic here);
 * the story host drives them with local state.
 */
export function TeleportTabBarView({ config }: TabBarViewProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(40);

  useEffect(() => {
    translateY.value = withTiming(0, { duration: DUR_SLOW });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const barStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(translateY.value, { duration: DUR_SLOW }) }],
  }));

  return (
    // Full-bleed card: surface fill + shadow (the upward component of
    // shadow-overlay separates it from content), no top border. Vertical
    // footprint and content insets keyed off TAB_BAR_BASE_HEIGHT hold.
    <Animated.View
      className="bg-surface shadow-overlay"
      style={[
        {
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          paddingTop: 14,
          paddingBottom: insets.bottom + 16,
        },
        barStyle,
      ]}
    >
      <View style={{ flexDirection: "row", height: TAB_BAR_BASE_HEIGHT }}>
        {config.items.map((item) => {
          const focused = item.key === config.activeKey;
          return (
            <UiPressable
              key={item.key}
              onPress={() => config.onPress(item.key)}
              testID={item.testID}
              className="flex-1 items-center justify-center gap-1"
            >
              <View style={{ position: "relative" }}>
                <Image
                  source={{ uri: item.icon }}
                  style={{ width: 32, height: 32, opacity: focused ? 1 : 0.62 }}
                  contentFit="contain"
                />
                {item.badge != null && item.badge > 0 ? (
                  <UiView className="absolute -top-1 -right-1 bg-danger rounded-full min-w-[20px] h-5 items-center justify-center px-1.5">
                    <UiText className="text-xs font-bold text-white">
                      {item.badge > 99 ? "99+" : item.badge}
                    </UiText>
                  </UiView>
                ) : item.dot ? (
                  <UiView className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-danger" />
                ) : null}
              </View>
              <UiText className={`text-sm ${focused ? "font-medium text-accent" : "text-muted"}`}>
                {item.label}
              </UiText>
            </UiPressable>
          );
        })}
      </View>
    </Animated.View>
  );
}
