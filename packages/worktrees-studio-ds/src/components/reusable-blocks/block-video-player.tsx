import { useRef, useState } from "react";
import { useVideoPlayer, VideoView, type VideoViewProps } from "expo-video";
import { Pressable, StyleSheet, type StyleProp, ViewStyle, View } from "react-native";
import { UiIcon } from "../heroui-primitive";

type Props = {
  /** Remote video URL. */
  uri: string;
  style?: StyleProp<ViewStyle>;
  /** E2E hook — the flow taps the video surface by testID. */
  testID?: string;
  /** Content fit mode — defaults to "contain". */
  contentFit?: "contain" | "cover" | "fill";
  /** Shows fullscreen floating action button in the bottom right corner. Default true. */
  showFullscreenFab?: boolean;
  /** Custom callback when the fullscreen FAB is pressed. If omitted, calls native `enterFullscreen()`. */
  onPressFullscreen?: () => void;
  /** TestID for the fullscreen FAB button. Defaults to `${testID}-fullscreen`. */
  fullscreenTestID?: string;
  /** Accessibility label for the fullscreen FAB button. */
  fullscreenA11yLabel?: string;
  /** VideoView button options in native controls / fullscreen mode. */
  buttonOptions?: VideoViewProps["buttonOptions"];
};

/**
 * expo-video wrapper (SDK 57) matching the school `VideoPlayer` behaviour:
 * **loop** (repeats until the user pauses), **autoplay** once the source
 * loads, and **pause/play on touch** (the whole surface is the toggle —
 * `nativeControls={false}` inline, enabled automatically in fullscreen).
 * Configured with `maxBufferBytes` to avoid OOM memory leaks on continuous
 * looping, and `surfaceType="textureView"` on Android to prevent surface
 * re-parenting crashes in fullscreen.
 */
export function BlockVideoPlayer({
  uri,
  style,
  testID,
  contentFit = "contain",
  showFullscreenFab = true,
  onPressFullscreen,
  fullscreenTestID,
  fullscreenA11yLabel,
  buttonOptions,
}: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoViewRef = useRef<VideoView>(null);
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.bufferOptions = {
      maxBufferBytes: 5_000_000,
      prioritizeTimeOverSizeThreshold: false,
    };
    void p.play();
  });

  const handlePress = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleFullscreenPress = (e: any) => {
    e.stopPropagation?.();
    if (onPressFullscreen) {
      onPressFullscreen();
    } else {
      videoViewRef.current?.enterFullscreen();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Pressable onPress={handlePress} style={styles.pressable} testID={testID}>
        <VideoView
          ref={videoViewRef}
          player={player}
          style={styles.video}
          nativeControls={isFullscreen}
          surfaceType="textureView"
          contentFit={contentFit}
          onFullscreenEnter={() => setIsFullscreen(true)}
          onFullscreenExit={() => setIsFullscreen(false)}
          buttonOptions={{
            showNext: false,
            showPrevious: false,
            showSettings: false,
            showSubtitles: false,
            ...buttonOptions,
          }}
        />
      </Pressable>

      {showFullscreenFab && (
        <Pressable
          testID={fullscreenTestID ?? (testID ? `${testID}-fullscreen` : "video-fullscreen-fab")}
          accessibilityRole="button"
          accessibilityLabel={fullscreenA11yLabel ?? "Fullscreen"}
          onPress={handleFullscreenPress}
          className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-black/60 items-center justify-center active:opacity-70 z-10"
        >
          <UiIcon name="expand-outline" size={18} className="text-white" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
  },
  pressable: {
    width: "100%",
    height: "100%",
  },
  video: {
    width: "100%",
    height: "100%",
  },
});
