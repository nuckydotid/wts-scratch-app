/* eslint-disable react-hooks/immutability */
import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import { Platform, Pressable } from "react-native";
import { Link } from "expo-router";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useCanvas } from "./canvas-context";
import { MonoText, UiIcon, UiView } from "../../components";

interface DragNodeProps {
  id: string;
  initialX?: number;
  initialY?: number;
  /** Blocks-page route for this screen, e.g. "/expo-story/blocks/admin-semester-detail-screen". */
  href?: string;
  /** Maestro-style e2e actions + assertions shown as a caption panel below the frame. */
  steps?: string[];
  children: ReactNode;
}

export default function DragNode({
  id,
  initialX = 0,
  initialY = 0,
  href,
  steps,
  children,
}: DragNodeProps) {
  const { scale, nodePositions, canvasPan, registerNode, unregisterNode } = useCanvas();
  const posX = useSharedValue(initialX);
  const posY = useSharedValue(initialY);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  useEffect(() => {
    nodePositions.value = { ...nodePositions.value, [id]: { x: initialX, y: initialY } };
    registerNode(id, { x: initialX, y: initialY, w: 0, h: 0 });
    return () => {
      unregisterNode(id);
      const next = { ...nodePositions.value };
      delete next[id];
      nodePositions.value = next;
    };
  }, [id, initialX, initialY, nodePositions, registerNode, unregisterNode]);

  const onLayout = useCallback(
    (e: { nativeEvent: { layout: { width: number; height: number } } }) => {
      const { width, height } = e.nativeEvent.layout;
      registerNode(id, { x: posX.value, y: posY.value, w: width, h: height });
    },
    [id, posX, posY, registerNode]
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .simultaneousWithExternalGesture(canvasPan)
        .onStart(() => {
          savedX.value = posX.value;
          savedY.value = posY.value;
        })
        .onUpdate((e) => {
          posX.value = savedX.value + e.translationX / scale.value;
          posY.value = savedY.value + e.translationY / scale.value;
          const p = { x: posX.value, y: posY.value };
          nodePositions.value = { ...nodePositions.value, [id]: p };
        }),
    [canvasPan, id, nodePositions, posX, posY, savedX, savedY, scale]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    transform: [{ translateX: posX.value }, { translateY: posY.value }],
  }));

  const content = href ? (
    <Link href={href as any} asChild>
      <Pressable style={Platform.select({ web: { cursor: "pointer" }, default: undefined })}>
        {children}
        <UiView
          pointerEvents="none"
          className="absolute top-2 right-2 flex-row items-center gap-1 px-2 py-1 rounded-full bg-background/80 border border-separator"
        >
          <UiIcon name="open-outline" size={12} className="text-foreground" />
          <MonoText className="text-[10px] font-medium text-foreground">Open</MonoText>
        </UiView>
      </Pressable>
    </Link>
  ) : (
    children
  );

  const stepPanel =
    steps && steps.length > 0 ? (
      <UiView className="w-[375px] mt-2 rounded-lg border border-separator bg-background/90 p-3 gap-1">
        <MonoText className="text-[10px] font-semibold text-muted uppercase">E2E steps</MonoText>
        {steps.map((step, index) => {
          const isAssertion = /^(assertVisible|assertNotVisible|assertNothingVisible)/.test(step);
          return (
            <UiView key={`${index}-${step}`} className="flex-row items-start gap-1.5">
              <MonoText className="text-[10px] text-accent leading-4">•</MonoText>
              <MonoText
                className={`text-[10px] flex-1 leading-4 ${
                  isAssertion ? "text-foreground" : "text-accent"
                }`}
              >
                {step}
              </MonoText>
            </UiView>
          );
        })}
      </UiView>
    ) : null;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View onLayout={onLayout} style={animatedStyle}>
        {content}
        {stepPanel}
      </Animated.View>
    </GestureDetector>
  );
}
