import Svg, { Path, Defs, Marker, Polygon, Text as SvgText } from "react-native-svg";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedProps } from "react-native-reanimated";
import { useCanvas } from "./canvas-context";

interface SvgArrowProps {
  from: string;
  to: string;
  label?: string;
}

const NODE_W = 375;
const NODE_H = 812;
const BLEND = 20;

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedSvgText = Animated.createAnimatedComponent(SvgText);

function smoothstepPath(x1: number, y1: number, x2: number, y2: number): string {
  const cx = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dy = Math.abs(y2 - y1);
  const bend = Math.min(BLEND, dy / 2);

  if (y1 === y2) {
    return `M ${x1} ${y1} L ${cx - bend} ${y1} Q ${cx} ${y1} ${cx} ${y1} L ${cx + bend} ${y1} L ${x2} ${y2}`;
  }

  return [
    `M ${x1} ${y1}`,
    `L ${cx - bend} ${y1}`,
    `Q ${cx} ${y1} ${cx} ${y1 + bend}`,
    `L ${cx} ${midY - bend}`,
    `Q ${cx} ${midY} ${cx + bend} ${midY}`,
    `L ${x2 - bend} ${midY}`,
    `Q ${x2} ${midY} ${x2} ${midY + bend}`,
    `L ${x2} ${y2 - bend}`,
    `Q ${x2} ${y2} ${x2 + bend} ${y2}`,
    `L ${x2} ${y2}`,
  ].join(" ");
}

export default function SvgArrow({ from, to, label }: SvgArrowProps) {
  const { nodePositions } = useCanvas();

  const animatedProps = useAnimatedProps(() => {
    const src = nodePositions.value[from];
    const dst = nodePositions.value[to];
    if (!src || !dst) return { d: "" };
    const x1 = src.x + NODE_W;
    const y1 = src.y + NODE_H / 2;
    const x2 = dst.x;
    const y2 = dst.y + NODE_H / 2;
    return { d: smoothstepPath(x1, y1, x2, y2) };
  });

  const labelProps = useAnimatedProps(() => {
    const src = nodePositions.value[from];
    const dst = nodePositions.value[to];
    if (!src || !dst) return { x: 0, y: 0 };
    const x1 = src.x + NODE_W;
    const y1 = src.y + NODE_H / 2;
    const x2 = dst.x;
    const y2 = dst.y + NODE_H / 2;
    return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 - 12 };
  });

  return (
    <Svg style={[StyleSheet.absoluteFill, { overflow: "visible" }]} pointerEvents="none">
      <Defs>
        <Marker
          id="arrow"
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={8}
          markerHeight={8}
          orient="auto"
        >
          <Polygon points="0 0, 10 5, 0 10" fill="var(--foreground)" opacity={0.4} />
        </Marker>
      </Defs>
      <AnimatedPath
        animatedProps={animatedProps}
        stroke="var(--foreground)"
        strokeOpacity={0.3}
        strokeWidth={2}
        fill="none"
        markerEnd="url(#arrow)"
      />
      {label && (
        <AnimatedSvgText
          animatedProps={labelProps}
          fill="var(--foreground)"
          fontSize={12}
          opacity={0.5}
          textAnchor="middle"
        >
          {label}
        </AnimatedSvgText>
      )}
    </Svg>
  );
}
