import { useEffect, useRef, useState, type ReactNode } from "react";
import { type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { UiView } from "../heroui-primitive";

export type SkeletonFadePhase = "skeleton" | "blank" | "content";

const isTestEnv = process.env.NODE_ENV === "test";
export const DEFAULT_MIN_SKELETON_MS = isTestEnv ? 0 : 1000;
export const DEFAULT_BLANK_DELAY_MS = isTestEnv ? 0 : 600;
export const DEFAULT_FADE_OUT_MS = isTestEnv ? 0 : 150;
export const DEFAULT_FADE_DURATION_MS = DEFAULT_FADE_OUT_MS;

export type SkeletonFadeOptions = {
  /** Minimum duration in ms to show the skeleton (default: 1000ms). */
  minSkeletonMs?: number;
  /** Duration in ms that skeleton remains transparent before content shows (default: 600ms). */
  delayMs?: number;
  /** Duration in ms for skeleton fade-out to transparent (default: 150ms). */
  fadeOutMs?: number;
  /** @deprecated Kept for backwards compatibility */
  fadeDurationMs?: number;
};

/**
 * Hook managing the skeleton loading lifecycle.
 * - Skeletons show for at least 1000ms.
 * - Skeletons then fade out to transparent over fadeOutMs (150ms) and stay transparent for 600ms.
 * - Real content is revealed only after the 600ms transparent gap, with zero content animation.
 */
export function useSkeletonFade(isLoading: boolean, options?: SkeletonFadeOptions) {
  const minSkeletonMs = options?.minSkeletonMs ?? DEFAULT_MIN_SKELETON_MS;
  const delayMs = options?.delayMs ?? DEFAULT_BLANK_DELAY_MS;
  const fadeOutMs = options?.fadeOutMs ?? options?.fadeDurationMs ?? DEFAULT_FADE_OUT_MS;

  const [phase, setPhase] = useState<SkeletonFadePhase>(() => (isLoading ? "skeleton" : "content"));
  const [prevIsLoading, setPrevIsLoading] = useState(isLoading);

  if (prevIsLoading !== isLoading) {
    setPrevIsLoading(isLoading);
    if (isLoading) {
      setPhase("skeleton");
    } else if (minSkeletonMs === 0 && delayMs === 0) {
      setPhase("content");
    }
  }

  const loadStartTimeRef = useRef<number>(0);
  const t1Ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t2Ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  const opacity = useSharedValue(isLoading ? 1 : 0);

  const clearTimers = () => {
    if (t1Ref.current) {
      clearTimeout(t1Ref.current);
      t1Ref.current = null;
    }
    if (t2Ref.current) {
      clearTimeout(t2Ref.current);
      t2Ref.current = null;
    }
  };

  useEffect(() => {
    if (isLoading) {
      clearTimers();
      loadStartTimeRef.current = Date.now();
      opacity.value = 1;
      return;
    }

    if (loadStartTimeRef.current === 0) {
      // Mounted with isLoading=false
      opacity.value = 0;
      return;
    }

    clearTimers();
    const elapsed = Date.now() - loadStartTimeRef.current;
    const minWait = Math.max(0, minSkeletonMs - elapsed);

    if (minWait === 0 && delayMs === 0) {
      opacity.value = 0;
      return;
    }

    // After minimum skeleton display time, animate skeleton to transparent
    t1Ref.current = setTimeout(() => {
      setPhase("blank");
      if (fadeOutMs > 0) {
        opacity.value = withTiming(0, {
          duration: fadeOutMs,
          easing: Easing.out(Easing.ease),
        });
      } else {
        opacity.value = 0;
      }
      t1Ref.current = null;
    }, minWait);

    // After transparent gap completes, reveal content
    t2Ref.current = setTimeout(() => {
      setPhase("content");
      t2Ref.current = null;
    }, minWait + delayMs);

    return () => {
      clearTimers();
    };
  }, [isLoading, minSkeletonMs, delayMs, fadeOutMs, opacity]);

  const skeletonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const showSkeleton = phase !== "content";

  return {
    phase,
    showSkeleton,
    isBlank: phase === "blank",
    isContent: phase === "content",
    skeletonAnimatedStyle,
    /** @deprecated Kept for backwards compatibility */
    animatedStyle: skeletonAnimatedStyle,
  };
}

export type BlockSkeletonFadeProps = SkeletonFadeOptions & {
  isLoading: boolean;
  style?: StyleProp<ViewStyle>;
  skeleton?: ReactNode;
  children?: ReactNode | ((showSkeleton: boolean) => ReactNode);
};

/**
 * Reusable wrapper where animation is for skeleton only:
 * - Shows skeleton for at least 1000ms.
 * - Skeletons become transparent for 600ms before content shows.
 * - Content renders directly with zero animation logic.
 */
export function BlockSkeletonFade({
  isLoading,
  minSkeletonMs,
  delayMs,
  fadeOutMs,
  fadeDurationMs,
  style,
  skeleton,
  children,
}: Readonly<BlockSkeletonFadeProps>) {
  const { showSkeleton, skeletonAnimatedStyle } = useSkeletonFade(isLoading, {
    minSkeletonMs,
    delayMs,
    fadeOutMs: fadeOutMs ?? fadeDurationMs,
  });

  if (showSkeleton) {
    const skeletonContent = typeof children === "function" ? children(true) : skeleton;
    return (
      <Animated.View style={[{ flex: 1 }, style, skeletonAnimatedStyle]} pointerEvents="none">
        {skeletonContent}
      </Animated.View>
    );
  }

  const realContent = typeof children === "function" ? children(false) : children;

  return style ? <UiView style={[{ flex: 1 }, style]}>{realContent}</UiView> : <>{realContent}</>;
}
