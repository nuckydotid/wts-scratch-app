import { DUR_FAST } from "../../lib/animation";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

type Props = React.PropsWithChildren<{
  duration?: number;
  delay?: number;
  style?: import("react-native").ViewStyle;
  testID?: string;
}>;

/**
 * Reusable fade wrapper — short 150ms FadeIn/FadeOut for every block mount.
 * Use as `<BlockFade><BlockGroupedList .../></BlockFade>` or key skeleton/content
 * branches for cross-fade: `key={isLoading ? 'skeleton' : 'content'}`.
 */
export function BlockFade({ children, duration = DUR_FAST, delay = 0, style, testID }: Props) {
  return (
    <Animated.View
      entering={FadeIn.duration(duration).delay(delay)}
      exiting={FadeOut.duration(duration)}
      style={style}
      testID={testID}
    >
      {children}
    </Animated.View>
  );
}
