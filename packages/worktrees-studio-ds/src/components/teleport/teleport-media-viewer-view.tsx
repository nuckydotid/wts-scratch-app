import { testIds } from "@repo/worktrees-studio-shared-ids";
import { Z_MEDIA_VIEWER } from "../../lib/z-index";
import { DUR_MED } from "../../lib/animation";
import { useEffect } from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BLACK } from "../../lib/brand-colors";
import { UiIcon, UiView } from "../heroui-primitive";
import { BlockVideoPlayer } from "../reusable-blocks/block-video-player";
import type { TeleportMediaViewerConfig } from "./teleport-context";

export function TeleportMediaViewerView({
  config,
  onClose,
}: Readonly<{
  config: TeleportMediaViewerConfig;
  onClose: () => void;
}>) {
  const insets = useSafeAreaInsets();
  const mediaType = config.mediaType ?? "image";

  // Backdrop fade-in animation
  const backdropOpacity = useSharedValue(0);
  useEffect(() => {
    backdropOpacity.value = 1;
  }, [backdropOpacity]);

  const backdropAnim = useAnimatedStyle(() => ({
    opacity: withTiming(backdropOpacity.value, { duration: DUR_MED }),
  }));

  // Gesture shared values for image pinch-to-zoom and pan
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);
  const savedTranslationX = useSharedValue(0);
  const savedTranslationY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, Math.min(savedScale.value * e.scale, 5));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= 1) {
        scale.value = withSpring(1);
        translationX.value = withSpring(0);
        translationY.value = withSpring(0);
        savedTranslationX.value = 0;
        savedTranslationY.value = 0;
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) {
        translationX.value = savedTranslationX.value + e.translationX;
        translationY.value = savedTranslationY.value + e.translationY;
      }
    })
    .onEnd(() => {
      savedTranslationX.value = translationX.value;
      savedTranslationY.value = translationY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withSpring(1);
        translationX.value = withSpring(0);
        translationY.value = withSpring(0);
        savedScale.value = 1;
        savedTranslationX.value = 0;
        savedTranslationY.value = 0;
      } else {
        scale.value = withSpring(2.5);
        savedScale.value = 2.5;
      }
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture, doubleTapGesture);

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translationX.value },
      { translateY: translationY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none" testID={config.testID}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: BLACK, zIndex: Z_MEDIA_VIEWER },
          backdropAnim,
        ]}
      >
        {/* Top bar with close button */}
        <UiView
          className="absolute left-0 right-0 z-20 flex-row items-center justify-end px-4"
          style={{ top: insets.top + 8 }}
          pointerEvents="box-none"
        >
          <Pressable
            testID="media-viewer-close"
            accessibilityRole="button"
            accessibilityLabel={config.closeA11yLabel ?? "Close fullscreen media"}
            onPress={onClose}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center active:opacity-70"
          >
            <UiIcon name="close" size={24} className="text-white" />
          </Pressable>
        </UiView>

        {/* Media content */}
        <UiView className="flex-1 items-center justify-center">
          {mediaType === "video" ? (
            <BlockVideoPlayer
              uri={config.uri}
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
              showFullscreenFab={false}
              testID={
                config.testID ? testIds.attachment(config.testID, "video") : "media-viewer-video"
              }
            />
          ) : (
            <GestureDetector gesture={composedGesture}>
              <Animated.View
                style={[
                  { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
                  imageAnimatedStyle,
                ]}
              >
                <Image
                  source={{ uri: config.uri }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="contain"
                  transition={200}
                />
              </Animated.View>
            </GestureDetector>
          )}
        </UiView>
      </Animated.View>
    </View>
  );
}
