/**
 * BlockImageCropSheet — cross-platform full-screen image crop overlay
 * (RN Modal).
 *
 * Modal presentation (not a teleport overlay) on purpose: the Modal is its
 * own native window, so it always paints above everything (open sheets,
 * chrome, tab bars) and never fights the teleport stacking/background
 * rules. `GestureHandlerRootView` MUST stay inside the Modal — a Modal
 * creates a new native window detached from the app root, so gestures
 * would silently fail without it.
 *
 * The DS never picks or uploads: the host launches the picker, passes the
 * picked asset's `uri`/dimensions via `visible`, and uploads the
 * `CroppedImageAsset` returned by `onConfirm`.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets, useSafeAreaFrame } from "react-native-safe-area-context";
import { BLACK, WHITE } from "../../lib/brand-colors";

/** Teleport overlay palette (camera/crop surfaces, non-theme). */
const CROP_SHEET_COLORS = { overlay: BLACK, panel: "#111", onOverlay: WHITE } as const;

export interface CroppedImageAsset {
  uri: string;
  width: number;
  height: number;
  mimeType: string;
  fileName: string;
  base64: string | null;
}

export interface BlockImageCropSheetProps {
  visible?: boolean;
  uri: string;
  sourceWidth: number;
  sourceHeight: number;
  /**
   * Locked aspect ratio [w, h].
   * - `undefined` → derive from `shape` (square=1:1, portrait=3:4, circle=free+mask)
   * - `null`     → free crop regardless of `shape`
   * - `[w, h]`   → locked to that ratio (the ratio bar starts on it)
   */
  aspectRatio?: [number, number] | null;
  /** Controls the overlay mask shape. */
  shape?: "square" | "portrait" | "circle";
  /**
   * Ratio options shown in the bottom bar. Defaults to Free + common ratios.
   * Pass an empty array to hide the ratio bar.
   */
  ratioOptions?: ([number, number] | null)[];
  ratioFreeLabel: string;
  /** Max pixel dimension on the longest side after crop (resizes if exceeded). */
  maxDimension?: number;
  title: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: (asset: CroppedImageAsset) => void;
  onCancel: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const HANDLE_SIZE = 32;
const DEFAULT_RATIO_OPTIONS: ([number, number] | null)[] = [null, [1, 1], [3, 4], [4, 3], [16, 9]];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  "worklet";
  return Math.min(Math.max(value, min), max);
}

function initialCropBox(
  imgW: number,
  imgH: number,
  ar: [number, number] | null
): { x: number; y: number; w: number; h: number } {
  if (ar) {
    const [aw, ah] = ar;
    let w = imgW;
    let h = (w * ah) / aw;
    if (h > imgH) {
      h = imgH;
      w = (h * aw) / ah;
    }
    return { x: (imgW - w) / 2, y: (imgH - h) / 2, w, h };
  }
  return { x: 0, y: 0, w: imgW, h: imgH };
}

function ratioLabel(r: [number, number] | null, freeLabel: string): string {
  if (!r) return freeLabel;
  const [w, h] = r;
  return `${w}:${h}`;
}

function ratioEqual(a: [number, number] | null, b: [number, number] | null): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return a[0] === b[0] && a[1] === b[1];
}

function resolveLockedAspectRatio(
  aspectRatio: [number, number] | null | undefined,
  shape: "square" | "portrait" | "circle"
): [number, number] | null {
  if (aspectRatio !== undefined) {
    return aspectRatio;
  }
  if (shape === "square") {
    return [1, 1];
  }
  if (shape === "portrait") {
    return [3, 4];
  }
  return null;
}

interface AspectRatioCropParams {
  x: number;
  y: number;
  w: number;
  srcW: number;
  srcH: number;
  minPx: number;
  arW: number;
  arH: number;
}

function sanitizeAspectRatioRect(params: AspectRatioCropParams): {
  x: number;
  y: number;
  w: number;
  h: number;
} {
  "worklet";
  const { x, y, w, srcW, srcH, minPx, arW, arH } = params;
  let rw = Math.max(w, minPx);
  let rh = (rw * arH) / arW;
  if (rh < minPx) {
    rh = minPx;
    rw = (rh * arW) / arH;
  }
  const shrink = Math.min(srcW / rw, srcH / rh, 1);
  rw *= shrink;
  rh *= shrink;

  const maxX = Math.max(0, srcW - rw);
  const maxY = Math.max(0, srcH - rh);
  const rx = clamp(x, 0, maxX);
  const ry = clamp(y, 0, maxY);

  const availW = srcW - rx;
  const availH = srcH - ry;
  const fitW = Math.min(availW, (availH * arW) / arH);
  rw = Math.min(rw, fitW);
  rh = (rw * arH) / arW;

  return {
    x: clamp(rx, 0, Math.max(0, srcW - rw)),
    y: clamp(ry, 0, Math.max(0, srcH - rh)),
    w: rw,
    h: rh,
  };
}

function sanitizeFreeRect(
  x: number,
  y: number,
  w: number,
  h: number,
  srcW: number,
  srcH: number,
  minPx: number
): { x: number; y: number; w: number; h: number } {
  "worklet";
  const rw = clamp(w, minPx, srcW);
  const rh = clamp(h, minPx, srcH);
  const rx = clamp(x, 0, Math.max(0, srcW - rw));
  const ry = clamp(y, 0, Math.max(0, srcH - rh));
  return {
    x: rx,
    y: ry,
    w: Math.min(rw, srcW - rx),
    h: Math.min(rh, srcH - ry),
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BlockImageCropSheet({
  visible = true,
  uri,
  sourceWidth,
  sourceHeight,
  aspectRatio,
  shape = "square",
  ratioOptions = DEFAULT_RATIO_OPTIONS,
  ratioFreeLabel,
  maxDimension,
  title,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: Readonly<BlockImageCropSheetProps>) {
  const insets = useSafeAreaInsets();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useSafeAreaFrame();
  const [processing, setProcessing] = useState(false);

  const lockedAr = resolveLockedAspectRatio(aspectRatio, shape);
  const [activeRatio, setActiveRatio] = useState<[number, number] | null>(lockedAr);

  const showRatioBar = ratioOptions.length > 0 && lockedAr === null;
  const toolbarH = 56;
  const ratioBarH = showRatioBar ? 64 : 0;

  const previewW = SCREEN_WIDTH;
  const previewH = SCREEN_HEIGHT - insets.top - insets.bottom - toolbarH - ratioBarH - 16;

  // Letterboxed "contain" layout inside the preview, with padding around the image.
  const pad = 24;
  const maxImgW = Math.max(1, previewW - pad * 2);
  const maxImgH = Math.max(1, previewH - pad * 2);
  const displayScale = Math.min(maxImgW / sourceWidth, maxImgH / sourceHeight);
  const imgDisplayW = Math.round(sourceWidth * displayScale);
  const imgDisplayH = Math.round(sourceHeight * displayScale);
  const imgOffsetX = Math.round((previewW - imgDisplayW) / 2);
  const imgOffsetY = Math.round((previewH - imgDisplayH) / 2);

  // Initial crop rect in source pixels:
  const initialCrop = useMemo(
    () => initialCropBox(sourceWidth, sourceHeight, activeRatio),
    [sourceWidth, sourceHeight, activeRatio]
  );

  // Shared values — ALL in SOURCE PIXEL coordinates.
  const cropX = useSharedValue(initialCrop.x);
  const cropY = useSharedValue(initialCrop.y);
  const cropW = useSharedValue(initialCrop.w);
  const cropH = useSharedValue(initialCrop.h);

  // Gestures track drag start:
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const startW = useSharedValue(0);
  const startH = useSharedValue(0);

  // Minimum crop dimension in source pixels (at least 32px or 44pt display):
  const minCropPx = Math.max(32, Math.round(44 / Math.max(displayScale, 0.001)));

  // Shared values for worklets to read without closing over mutable props:
  const svSrcW = useSharedValue(sourceWidth);
  const svSrcH = useSharedValue(sourceHeight);
  const svScale = useSharedValue(displayScale);
  const svMinCrop = useSharedValue(minCropPx);
  const svArW = useSharedValue(activeRatio ? activeRatio[0] : 0);
  const svArH = useSharedValue(activeRatio ? activeRatio[1] : 0);

  // Sync shared values when props change:
  useEffect(() => {
    svSrcW.value = sourceWidth;
    svSrcH.value = sourceHeight;
    svScale.value = displayScale;
    svMinCrop.value = minCropPx;
    svArW.value = activeRatio ? activeRatio[0] : 0;
    svArH.value = activeRatio ? activeRatio[1] : 0;
  }, [
    sourceWidth,
    sourceHeight,
    displayScale,
    minCropPx,
    activeRatio,
    svSrcW,
    svSrcH,
    svScale,
    svMinCrop,
    svArW,
    svArH,
  ]);

  // ---------- Animated box style ----------
  const boxStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: imgOffsetX + cropX.value * svScale.value,
    top: imgOffsetY + cropY.value * svScale.value,
    width: cropW.value * svScale.value,
    height: cropH.value * svScale.value,
  }));

  // ---------- Change ratio (from ratio bar) ----------
  const changeRatio = useCallback(
    (newRatio: [number, number] | null) => {
      svArW.set(newRatio ? newRatio[0] : 0);
      svArH.set(newRatio ? newRatio[1] : 0);
      const box = initialCropBox(sourceWidth, sourceHeight, newRatio);
      cropX.set(box.x);
      cropY.set(box.y);
      cropW.set(box.w);
      cropH.set(box.h);
      setActiveRatio(newRatio);
    },
    [svArW, svArH, cropX, cropY, cropW, cropH, sourceWidth, sourceHeight]
  );

  // ---------- Gestures (created once) ----------
  const gestures = useMemo(() => {
    /**
     * Forces the crop rect (source pixel space) to stay inside the image.
     */
    function sanitizeCropRect(
      x: number,
      y: number,
      w: number,
      h: number
    ): { x: number; y: number; w: number; h: number } {
      "worklet";
      const srcW = svSrcW.value;
      const srcH = svSrcH.value;
      const minPx = svMinCrop.value;
      const arW = svArW.value;
      const arH = svArH.value;

      if (arW > 0 && arH > 0) {
        return sanitizeAspectRatioRect({ x, y, w, srcW, srcH, minPx, arW, arH });
      }
      return sanitizeFreeRect(x, y, w, h, srcW, srcH, minPx);
    }

    function makeCorner(anchor: "tl" | "tr" | "bl" | "br") {
      return Gesture.Pan()
        .onStart(() => {
          "worklet";
          startX.set(cropX.value);
          startY.set(cropY.value);
          startW.set(cropW.value);
          startH.set(cropH.value);
        })
        .onUpdate((e) => {
          "worklet";
          const sc = svScale.value;
          const dx = e.translationX / sc;
          const dy = e.translationY / sc;
          const isLeft = anchor === "tl" || anchor === "bl";
          const isTop = anchor === "tl" || anchor === "tr";
          const nx = isLeft ? startX.value + dx : startX.value;
          let ny = isTop ? startY.value + dy : startY.value;
          const nw = isLeft ? startW.value - dx : startW.value + dx;
          let nh = isTop ? startH.value - dy : startH.value + dy;

          const arW = svArW.value;
          const arH = svArH.value;
          if (arW > 0 && arH > 0) {
            nh = (nw * arH) / arW;
            if (isTop) {
              ny = startY.value + startH.value - nh;
            }
          }

          const c = sanitizeCropRect(nx, ny, nw, nh);
          cropX.set(c.x);
          cropY.set(c.y);
          cropW.set(c.w);
          cropH.set(c.h);
        });
    }

    const move = Gesture.Pan()
      .onStart(() => {
        "worklet";
        startX.set(cropX.value);
        startY.set(cropY.value);
        startW.set(cropW.value);
        startH.set(cropH.value);
      })
      .onUpdate((e) => {
        "worklet";
        const sc = svScale.value;
        const dx = e.translationX / sc;
        const dy = e.translationY / sc;
        const nx = startX.value + dx;
        const ny = startY.value + dy;
        const c = sanitizeCropRect(nx, ny, startW.value, startH.value);
        cropX.set(c.x);
        cropY.set(c.y);
        cropW.set(c.w);
        cropH.set(c.h);
      });

    return {
      tl: makeCorner("tl"),
      tr: makeCorner("tr"),
      bl: makeCorner("bl"),
      br: makeCorner("br"),
      move,
    };
  }, []);

  // ---------- Confirm ----------
  const handleConfirm = useCallback(async () => {
    if (processing) return;
    setProcessing(true);
    try {
      // Clamp crop rect to avoid "crop rectangle is outside source image" errors
      // caused by floating-point drift at the boundary.
      const x = Math.max(0, Math.round(cropX.value));
      const y = Math.max(0, Math.round(cropY.value));
      const width = Math.max(1, Math.min(Math.round(cropW.value), sourceWidth - x));
      const height = Math.max(1, Math.min(Math.round(cropH.value), sourceHeight - y));

      const context = ImageManipulator.manipulate(uri);
      context.crop({ originX: x, originY: y, width, height });
      const maxDim = maxDimension;
      if (maxDim && (width > maxDim || height > maxDim)) {
        const scale = Math.min(maxDim / width, maxDim / height);
        context.resize({
          width: Math.round(width * scale),
          height: Math.round(height * scale),
        });
      }

      const imageRef = await context.renderAsync();
      const result = await imageRef.saveAsync({
        compress: 0.85,
        format: SaveFormat.JPEG,
        base64: true,
      });

      onConfirm({
        uri: result.uri,
        width: result.width,
        height: result.height,
        mimeType: "image/jpeg",
        fileName: `cropped_${Date.now()}.jpg`,
        base64: result.base64 ?? null,
      });
    } catch (e) {
      console.error("[BlockImageCropSheet] crop failed:", e);
      setProcessing(false);
    }
  }, [
    maxDimension,
    processing,
    uri,
    cropX,
    cropY,
    cropW,
    cropH,
    sourceWidth,
    sourceHeight,
    onConfirm,
  ]);

  const isCircle = shape === "circle";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      {/*
       * GestureHandlerRootView MUST be inside the Modal.
       * A Modal creates a new native window (detached from the app root),
       * so it sits outside the GestureHandlerRootView in App's tree.
       * Without this wrapper, all gestures silently fail on both platforms.
       */}
      <GestureHandlerRootView style={styles.gestureRoot}>
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          {/* Top toolbar */}
          <View style={styles.toolbar}>
            <Pressable
              testID="crop-cancel"
              onPress={onCancel}
              style={styles.toolbarBtn}
              hitSlop={12}
            >
              <Text style={styles.toolbarBtnText}>{cancelLabel}</Text>
            </Pressable>
            <Text style={styles.toolbarTitle}>{title}</Text>
            <Pressable
              testID="crop-confirm"
              onPress={handleConfirm}
              style={styles.toolbarBtn}
              hitSlop={12}
              disabled={processing}
            >
              <Text style={[styles.toolbarBtnText, styles.toolbarConfirm]}>
                {processing ? "…" : confirmLabel}
              </Text>
            </Pressable>
          </View>

          {/* Preview area */}
          <View style={[styles.preview, { width: previewW, height: previewH }]}>
            {/* Source image */}
            <Image
              source={{ uri }}
              style={{
                position: "absolute",
                left: imgOffsetX,
                top: imgOffsetY,
                width: imgDisplayW,
                height: imgDisplayH,
              }}
              contentFit="contain"
            />

            {/* Dark mask around crop box (4 rectangles) */}
            <CropMask
              imgOffsetX={imgOffsetX}
              imgOffsetY={imgOffsetY}
              imgDisplayW={imgDisplayW}
              imgDisplayH={imgDisplayH}
              cropX={cropX}
              cropY={cropY}
              cropW={cropW}
              cropH={cropH}
              svScale={svScale}
              isCircle={isCircle}
            />

            {/* Crop box: border + grid + corner handles */}
            <Animated.View style={boxStyle} pointerEvents="box-none">
              {/* Inner move area */}
              <GestureDetector gesture={gestures.move}>
                <View style={styles.moveHandle} />
              </GestureDetector>

              {/* Decorative border + grid (non-interactive) */}
              <View style={styles.cropBorder} pointerEvents="none" />
              <View style={[styles.gridLine, styles.gridLineH1]} pointerEvents="none" />
              <View style={[styles.gridLine, styles.gridLineH2]} pointerEvents="none" />
              <View style={[styles.gridLine, styles.gridLineV1]} pointerEvents="none" />
              <View style={[styles.gridLine, styles.gridLineV2]} pointerEvents="none" />

              {/* Corner handles */}
              <CornerHandle position="tl" gesture={gestures.tl} />
              <CornerHandle position="tr" gesture={gestures.tr} />
              <CornerHandle position="bl" gesture={gestures.bl} />
              <CornerHandle position="br" gesture={gestures.br} />
            </Animated.View>
          </View>

          {/* Bottom: ratio picker bar */}
          {showRatioBar && (
            <View style={styles.ratioBar}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.ratioBarContent}
              >
                {ratioOptions.map((r) => {
                  const active = ratioEqual(r, activeRatio);
                  const key = r ? `${r[0]}:${r[1]}` : "free";
                  return (
                    <Pressable
                      key={key}
                      onPress={() => changeRatio(r)}
                      style={[styles.ratioPill, active && styles.ratioPillActive]}
                      hitSlop={8}
                    >
                      <Text style={[styles.ratioPillText, active && styles.ratioPillTextActive]}>
                        {ratioLabel(r, ratioFreeLabel)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>

        {processing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color={CROP_SHEET_COLORS.onOverlay} />
          </View>
        )}
      </GestureHandlerRootView>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// CropMask
// ---------------------------------------------------------------------------

interface CropMaskProps {
  imgOffsetX: number;
  imgOffsetY: number;
  imgDisplayW: number;
  imgDisplayH: number;
  cropX: SharedValue<number>;
  cropY: SharedValue<number>;
  cropW: SharedValue<number>;
  cropH: SharedValue<number>;
  svScale: SharedValue<number>;
  isCircle: boolean;
}

function CropMask({
  imgOffsetX,
  imgOffsetY,
  imgDisplayW,
  imgDisplayH,
  cropX,
  cropY,
  cropW,
  cropH,
  svScale,
  isCircle,
}: Readonly<CropMaskProps>) {
  const maskColor = "rgba(0,0,0,0.55)";

  const topStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: imgOffsetX,
    top: imgOffsetY,
    width: imgDisplayW,
    height: cropY.value * svScale.value,
    backgroundColor: maskColor,
  }));

  const bottomStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: imgOffsetX,
    top: imgOffsetY + (cropY.value + cropH.value) * svScale.value,
    width: imgDisplayW,
    height: imgDisplayH - (cropY.value + cropH.value) * svScale.value,
    backgroundColor: maskColor,
  }));

  const leftStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: imgOffsetX,
    top: imgOffsetY + cropY.value * svScale.value,
    width: cropX.value * svScale.value,
    height: cropH.value * svScale.value,
    backgroundColor: maskColor,
  }));

  const rightStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: imgOffsetX + (cropX.value + cropW.value) * svScale.value,
    top: imgOffsetY + cropY.value * svScale.value,
    width: imgDisplayW - (cropX.value + cropW.value) * svScale.value,
    height: cropH.value * svScale.value,
    backgroundColor: maskColor,
  }));

  const circleStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: imgOffsetX + cropX.value * svScale.value,
    top: imgOffsetY + cropY.value * svScale.value,
    width: cropW.value * svScale.value,
    height: cropH.value * svScale.value,
    borderRadius: (cropW.value * svScale.value) / 2,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.75)",
  }));

  return (
    <>
      <Animated.View style={topStyle} pointerEvents="none" />
      <Animated.View style={bottomStyle} pointerEvents="none" />
      <Animated.View style={leftStyle} pointerEvents="none" />
      <Animated.View style={rightStyle} pointerEvents="none" />
      {isCircle && <Animated.View style={circleStyle} pointerEvents="none" />}
    </>
  );
}

// ---------------------------------------------------------------------------
// CornerHandle
// ---------------------------------------------------------------------------

interface CornerHandleProps {
  position: "tl" | "tr" | "bl" | "br";
  gesture: ReturnType<typeof Gesture.Pan>;
}

function CornerHandle({ position, gesture }: Readonly<CornerHandleProps>) {
  const posStyle = {
    tl: { top: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2 },
    tr: { top: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2 },
    bl: { bottom: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2 },
    br: { bottom: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2 },
  }[position];

  const borderStyle = {
    tl: { borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 4 },
    tr: { borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 4 },
    bl: { borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 4 },
    br: {
      borderBottomWidth: 3,
      borderRightWidth: 3,
      borderBottomRightRadius: 4,
    },
  }[position];

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.cornerHandle, posStyle, borderStyle]} hitSlop={16} />
    </GestureDetector>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
    backgroundColor: CROP_SHEET_COLORS.overlay,
  },
  container: {
    flex: 1,
    backgroundColor: CROP_SHEET_COLORS.overlay,
  },
  toolbar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  toolbarBtn: {
    minWidth: 60,
  },
  toolbarBtnText: {
    color: CROP_SHEET_COLORS.onOverlay,
    fontSize: 16,
  },
  toolbarConfirm: {
    fontWeight: "700",
    textAlign: "right",
  },
  toolbarTitle: {
    color: CROP_SHEET_COLORS.onOverlay,
    fontSize: 16,
    fontWeight: "600",
  },
  preview: {
    overflow: "hidden",
    backgroundColor: CROP_SHEET_COLORS.panel,
  },
  moveHandle: {
    position: "absolute",
    top: "15%",
    left: "15%",
    width: "70%",
    height: "70%",
  },
  cropBorder: {
    ...StyleSheet.absoluteFill,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.85)",
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  gridLineH1: {
    left: 0,
    right: 0,
    top: "33.33%",
    height: StyleSheet.hairlineWidth,
  },
  gridLineH2: {
    left: 0,
    right: 0,
    top: "66.66%",
    height: StyleSheet.hairlineWidth,
  },
  gridLineV1: {
    top: 0,
    bottom: 0,
    left: "33.33%",
    width: StyleSheet.hairlineWidth,
  },
  gridLineV2: {
    top: 0,
    bottom: 0,
    left: "66.66%",
    width: StyleSheet.hairlineWidth,
  },
  cornerHandle: {
    position: "absolute",
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderColor: CROP_SHEET_COLORS.onOverlay,
  },
  ratioBar: {
    height: 64,
    justifyContent: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  ratioBarContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 8,
  },
  ratioPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  ratioPillActive: {
    backgroundColor: CROP_SHEET_COLORS.onOverlay,
  },
  ratioPillText: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 13,
    fontWeight: "600",
  },
  ratioPillTextActive: {
    color: CROP_SHEET_COLORS.overlay,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
});
