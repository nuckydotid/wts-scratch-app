import { Z_SHEET } from "../../lib/z-index";
import { DUR_SLOW } from "../../lib/animation";
import { useSheetSlide } from "../../hooks/use-sheet-slide";
import { type ReactNode } from "react";
import { Keyboard, Platform, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useSafeAreaFrame, useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useCSSVariable } from "uniwind";
import { UiView, UiPressable, UiCloseButton, UiScrollView, UiText } from "../heroui-primitive";

type Props = {
  content: ReactNode;
  footer?: ReactNode;
  /** Pinned header (MANDATORY) — the sheet-form title/subtitle never scrolls
   * away with the fields. Mirrors BlockFormSheetHeader without importing
   * reusable-blocks (avoids a teleport ↔ blocks cycle). */
  title: string;
  subtitle: string;
  stepsBar?: ReactNode;
  /** Content already scrolls itself (VirtualizedList-backed pickers) — skip
   * the outer ScrollView so the list isn't nested inside a plain ScrollView
   * (RN warns it breaks windowing). Defaults to true. */
  scrollable?: boolean;
  onClose: () => void;
};

function FullSheetScrollView({
  children,
  bottomInset,
  backgroundColor,
}: {
  children: ReactNode;
  bottomInset: number;
  backgroundColor: string;
}) {
  const contentContainerStyle = { padding: 20, paddingBottom: 24 + bottomInset };
  if (Platform.OS === "web") {
    return (
      <UiScrollView
        style={{ flex: 1, backgroundColor }}
        contentContainerStyle={contentContainerStyle}
        keyboardShouldPersistTaps="handled"
      >
        <UiView style={{ flex: 1 }}>{children}</UiView>
      </UiScrollView>
    );
  }
  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, backgroundColor }}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      // No rubber-band/overscroll bounce in sheet forms (matches UiFlatList).
      overScrollMode="never"
      bounces={false}
      // iOS: any drag dismisses the keyboard (standard sheet behavior). Also
      // makes Maestro's standard `hideKeyboard` swipe work on every sheet —
      // long or short content — so the generated suites stay platform-agnostic.
      keyboardDismissMode="on-drag"
      // iOS: taps must reach fields while keyboard is open (never dismiss on first tap).
      // "handled" on iOS requires two taps (first dismisses, second focuses) which breaks
      // Maestro's tapOn→inputText atomic flow — focus stays on previous field and
      // inputText appends to it (legalName+Jakarta corruption). Use "always" on iOS.
      keyboardShouldPersistTaps={Platform.OS === "ios" ? "always" : "handled"}
      bottomOffset={20}
    >
      <UiView style={{ flex: 1 }}>{children}</UiView>
    </KeyboardAwareScrollView>
  );
}

/**
 * Full-sheet overlay.
 *
 * Layout rule: the sheet is a FLEX COLUMN — close row, scroll (flex: 1), and a
 * NORMAL-FLOW footer bar. The footer never overlaps the scroll (an absolute
 * footer over a full-height scroll swallows touches on device and the submit
 * becomes unreachable). The footer stays BOTTOM-ANCHORED on every platform —
 * deliberately NO keyboard ride: Android edge-to-edge IMEs do not resize the
 * window, so an iOS-only ride made the same flow behave differently per
 * platform (issue #73). E2E dismisses the keyboard per platform: Android uses
 * `hideKeyboard`; iOS cannot (`hideKeyboard` reports no standard dismiss
 * action), so it taps the pinned header dismiss area
 * (`full-sheet-dismiss-keys`). The keyboard-aware scroll keeps the focused
 * input visible while typing.
 */
export function TeleportFullSheetView({
  content,
  footer,
  title,
  subtitle,
  stepsBar,
  scrollable = true,
  onClose,
}: Props) {
  const { width: windowWidth } = useSafeAreaFrame();
  const insets = useSafeAreaInsets();
  const backgroundColor = useCSSVariable("--color-background") as string;
  const chromeColor = useCSSVariable("--color-surface") as string;
  const { translateX, close } = useSheetSlide(windowWidth, () => {
    Keyboard.dismiss();
    onClose();
  });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withTiming(translateX.value, { duration: DUR_SLOW }) }],
  }));

  return (
    <Animated.View
      className="bg-background"
      style={[{ ...StyleSheet.absoluteFill, backgroundColor }, sheetStyle]}
    >
      {/* Fixed chrome (close row / header / footer) sits ABOVE the scroll:
          the keyboard-aware scroll overdraws its flex slot once the keyboard
          opens, covering siblings with its opaque background — the header text
          painted behind it and was invisible (laid out but zero pixels). */}
      <UiView
        className="flex-row justify-end px-4 bg-surface"
        style={{ paddingTop: insets.top + 12, zIndex: Z_SHEET, backgroundColor: chromeColor }}
      >
        <UiCloseButton testID="full-sheet-close" onPress={close} />
      </UiView>
      <UiView
        className="px-5 pt-2 pb-1 bg-surface"
        style={{ zIndex: Z_SHEET, backgroundColor: chromeColor }}
      >
        {/* Tapping the static header dismisses the keyboard — mirrors the
            BlockFormSheetHeader dismiss area and gives Maestro a deterministic
            iOS dismissal target (`hideKeyboard` cannot dismiss the iOS IME). */}
        <UiPressable
          accessible={false}
          testID="full-sheet-dismiss-keys"
          onPress={() => Keyboard.dismiss()}
        >
          <UiText className="text-xl font-semibold text-foreground mb-2">{title}</UiText>
          <UiText className="text-sm text-muted mb-4">{subtitle}</UiText>
        </UiPressable>
        {stepsBar}
      </UiView>
      {scrollable ? (
        <FullSheetScrollView bottomInset={insets.bottom} backgroundColor={backgroundColor}>
          {content}
        </FullSheetScrollView>
      ) : (
        // The content (searchable picker / sectioned picker) is a
        // VirtualizedList with its own scroll + padding — wrapping it in a
        // ScrollView would double-scroll. The list scrolls flush to the
        // pinned footer (its own content padding clears it) and the opaque
        // footer's `insets.bottom + 12` covers the safe-area inset, so this
        // wrapper carries no bottom padding itself.
        <UiView className="flex-1 px-5 pt-2" style={{ backgroundColor }}>
          {content}
        </UiView>
      )}
      {footer && (
        // Normal-flow footer bar (never absolute): sits below the scroll in
        // layout, so touches always reach it once the keyboard is dismissed —
        // press feedback fires and the submit works on every platform.
        <UiView
          className="bg-surface px-5 pt-3"
          style={{
            paddingBottom: insets.bottom + 12,
            zIndex: Z_SHEET,
            backgroundColor: chromeColor,
          }}
        >
          {footer}
        </UiView>
      )}
    </Animated.View>
  );
}
