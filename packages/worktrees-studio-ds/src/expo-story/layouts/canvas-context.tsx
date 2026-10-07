/* eslint-disable react-hooks/immutability */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Gesture } from "react-native-gesture-handler";
import { useSharedValue, type SharedValue } from "react-native-reanimated";

export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ContentSize {
  width: number;
  height: number;
}

const CANVAS_PADDING = 100;

interface CanvasContextType {
  /** Size of the visible canvas area (set by DragCanvas); lets collaboration normalise scroll across window sizes. */
  viewport: SharedValue<{ w: number; h: number }>;
  scale: SharedValue<number>;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  nodePositions: SharedValue<Record<string, NodePosition>>;
  canvasPan: ReturnType<typeof Gesture.Pan>;
  contentSize: ContentSize;
  registerNode: (id: string, rect: NodeRect) => void;
  unregisterNode: (id: string) => void;
}

const CanvasContext = createContext<CanvasContextType | null>(null);

export function CanvasProvider({ children }: { children: ReactNode }) {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const viewport = useSharedValue({ w: 0, h: 0 });
  const nodePositions = useSharedValue<Record<string, NodePosition>>({});
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const canvasPan = useMemo(
    () =>
      Gesture.Pan()
        .minPointers(1)
        .maxPointers(1)
        .onStart(() => {
          savedTranslateX.value = translateX.value;
          savedTranslateY.value = translateY.value;
        })
        .onUpdate((e) => {
          translateX.value = savedTranslateX.value + e.translationX;
          translateY.value = savedTranslateY.value + e.translationY;
        }),
    [savedTranslateX, savedTranslateY, translateX, translateY]
  );

  const [nodes, setNodes] = useState<Record<string, NodeRect>>({});

  const registerNode = useCallback((id: string, rect: NodeRect) => {
    setNodes((prev) => ({ ...prev, [id]: rect }));
  }, []);

  const unregisterNode = useCallback((id: string) => {
    setNodes((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const contentSize = useMemo<ContentSize>(() => {
    const rects = Object.values(nodes);
    if (rects.length === 0) return { width: 0, height: 0 };
    const maxX = Math.max(...rects.map((r) => r.x + r.w));
    const maxY = Math.max(...rects.map((r) => r.y + r.h));
    return {
      width: Math.max(maxX, 0) + CANVAS_PADDING,
      height: Math.max(maxY, 0) + CANVAS_PADDING,
    };
  }, [nodes]);

  const value = useMemo(
    () => ({
      viewport,
      scale,
      translateX,
      translateY,
      nodePositions,
      canvasPan,
      contentSize,
      registerNode,
      unregisterNode,
    }),
    [
      viewport,
      scale,
      translateX,
      translateY,
      nodePositions,
      canvasPan,
      contentSize,
      registerNode,
      unregisterNode,
    ]
  );

  return <CanvasContext value={value}>{children}</CanvasContext>;
}

export function useCanvas(): CanvasContextType {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error("useCanvas must be used within CanvasProvider");
  return ctx;
}
