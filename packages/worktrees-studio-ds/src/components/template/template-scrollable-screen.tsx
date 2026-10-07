import { type ReactElement, type ReactNode } from "react";
import { useFakeRefresh } from "../../lib/timing";
import { Platform, RefreshControl, type RefreshControlProps } from "react-native";
import { useCSSVariable } from "uniwind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { UiView, UiScrollView } from "../heroui-primitive";

import { BlockSkeletonFade } from "../reusable-blocks/block-skeleton-fade";

type Props = {
  children: ReactNode | ((showSkeleton: boolean) => ReactNode);
  header?: ReactNode;
  footer?: ReactNode;
  isLoading?: boolean;
  skeleton?: ReactNode;
  minSkeletonMs?: number;
  delayMs?: number;
  fadeOutMs?: number;
  fadeDurationMs?: number;
  onRefresh?: () => void;
  /** Controlled refresh state (e.g. story preview). When omitted the template owns it. */
  refreshing?: boolean;
  contentPaddingBottom?: number;
  testID?: string;
};

type ScreenScrollViewProps = {
  children: ReactNode;
  refreshControl?: ReactElement<RefreshControlProps>;
  topInset: number;
};

function ScreenScrollView({ children, refreshControl, topInset }: Readonly<ScreenScrollViewProps>) {
  if (Platform.OS === "web") {
    // RNW wraps a present refreshControl in a View that inherits the
    // ScrollView's own style (including its padding) — doubling the horizontal
    // padding — and pull-to-refresh is a native-only gesture anyway.
    return <UiScrollView className="flex-1 px-5">{children}</UiScrollView>;
  }
  return (
    <KeyboardAwareScrollView
      style={{ flex: 1, paddingHorizontal: 16, paddingTop: topInset }}
      bottomOffset={20}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      // No rubber-band/overscroll bounce (matches UiFlatList); pull-to-refresh
      // via the refreshControl still works.
      overScrollMode="never"
      bounces={false}
      refreshControl={refreshControl}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}

export function TemplateScrollableScreen({
  children,
  header,
  footer,
  isLoading,
  skeleton,
  minSkeletonMs,
  delayMs,
  fadeOutMs,
  fadeDurationMs,
  onRefresh: onRefreshProp,
  refreshing: refreshingProp,
  contentPaddingBottom,
  testID,
}: Readonly<Props>) {
  const { refreshing: isRefreshing, onRefresh } = useFakeRefresh(onRefreshProp);
  const accentColor = useCSSVariable("--color-accent") as string;
  const insets = useSafeAreaInsets();
  const refreshing = refreshingProp ?? isRefreshing;

  const refreshControl = onRefreshProp ? (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={accentColor}
      colors={[accentColor]}
    />
  ) : undefined;

  const content =
    isLoading !== undefined ? (
      <BlockSkeletonFade
        isLoading={isLoading}
        skeleton={skeleton}
        minSkeletonMs={minSkeletonMs}
        delayMs={delayMs}
        fadeOutMs={fadeOutMs ?? fadeDurationMs}
      >
        {children}
      </BlockSkeletonFade>
    ) : typeof children === "function" ? (
      children(false)
    ) : (
      children
    );

  return (
    <UiView
      testID={testID}
      className="flex-1 bg-background overflow-hidden"
      style={{ paddingBottom: insets.bottom }}
    >
      {header}
      <ScreenScrollView topInset={header ? 0 : insets.top} refreshControl={refreshControl}>
        <UiView
          className="pt-6 pb-4"
          style={contentPaddingBottom != null ? { paddingBottom: contentPaddingBottom } : undefined}
        >
          {content}
        </UiView>
      </ScreenScrollView>
      {footer}
    </UiView>
  );
}
