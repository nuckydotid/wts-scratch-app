/* eslint-disable react-hooks/immutability */
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { Platform, View } from "react-native";
import { CollabFrameLayers } from "../collab";
import { useCanvas } from "./canvas-context";
import CanvasControls from "./canvas-controls";

interface DragCanvasProps {
  children: ReactNode;
  /** Story id (for example `flows/signup`): draws teammates' cursors and comment pins over the whole canvas. */
  collabStory?: string;
}

export default function DragCanvas({ children, collabStory }: DragCanvasProps) {
  const { scale, translateX, translateY, canvasPan, contentSize, viewport } = useCanvas();
  const savedScale = useSharedValue(1);
  const containerRef = useRef<View>(null);
  const contentRef = useRef<View>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .onStart(() => {
          savedScale.value = scale.value;
        })
        .onUpdate((e) => {
          scale.value = Math.min(2, Math.max(0.1, savedScale.value * e.scale));
        }),
    [savedScale, scale]
  );

  const composed = useMemo(
    () => Gesture.Simultaneous(canvasPan, pinchGesture),
    [canvasPan, pinchGesture]
  );

  const canvasStyle = useAnimatedStyle(() => ({
    width: Math.max(contentSize.width, viewportSize.width / scale.value),
    height: Math.max(contentSize.height, viewportSize.height / scale.value),
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Web: prevent page scroll on wheel inside canvas, use for zoom instead
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const el = containerRef.current as unknown as HTMLElement;
    if (!el) return;

    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY || 0;
      if (delta === 0) return;
      const factor = delta > 0 ? 0.9 : 1.1;
      scale.value = Math.min(2, Math.max(0.1, scale.value * factor));
    };

    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [scale]);

  return (
    <View
      ref={containerRef}
      style={{ flex: 1, overflow: "hidden" }}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setViewportSize({ width, height });
        viewport.value = { w: width, h: height };
      }}
    >
      <GestureDetector gesture={composed}>
        <Animated.View ref={contentRef} style={[canvasStyle]}>
          {children}
          {collabStory ? <CollabFrameLayers frame={contentRef} story={collabStory} /> : null}
        </Animated.View>
      </GestureDetector>
      <CanvasControls />
    </View>
  );
}
