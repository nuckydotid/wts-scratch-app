/* eslint-disable react-hooks/immutability */
import { Pressable, View } from "react-native";
import Animated, { withSpring } from "react-native-reanimated";
import { useCanvas } from "./canvas-context";

export default function CanvasControls() {
  const { scale, translateX, translateY } = useCanvas();

  const zoomIn = () => {
    scale.value = withSpring(Math.min(2, scale.value * 1.3));
  };

  const zoomOut = () => {
    scale.value = withSpring(Math.max(0.1, scale.value * 0.75));
  };

  const fitAll = () => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
  };

  const btnClass =
    "w-9 h-9 rounded-lg items-center justify-center bg-background border border-separator";

  return (
    <View
      style={{
        position: "absolute",
        bottom: 16,
        right: 16,
        flexDirection: "column",
        gap: 4,
        zIndex: 10,
      }}
      pointerEvents="box-none"
    >
      <Pressable onPress={zoomIn} className={btnClass}>
        <Animated.Text className="text-lg text-foreground font-bold">+</Animated.Text>
      </Pressable>
      <Pressable onPress={zoomOut} className={btnClass}>
        <Animated.Text className="text-lg text-foreground font-bold">−</Animated.Text>
      </Pressable>
      <Pressable onPress={fitAll} className={btnClass}>
        <Animated.Text className="text-base text-foreground font-bold">⟲</Animated.Text>
      </Pressable>
    </View>
  );
}
