import { useCallback, useEffect } from "react";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { DUR_MED, DUR_SLOW, SHEET_CLOSE_MS } from "../lib/animation";

/**
 * Shared slide-in/out animation for overlay sheets (drawer, full-sheet):
 * mounts off-screen at `hiddenOffset`, animates to 0 on mount, and `close`
 * slides back before invoking `onClose` after the close duration.
 */
export function useSheetSlide(hiddenOffset: number, onClose: () => void) {
  const translateX = useSharedValue(hiddenOffset);

  useEffect(() => {
    translateX.value = withTiming(0, { duration: DUR_SLOW });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = useCallback(() => {
    // eslint-disable-next-line react-hooks/immutability
    translateX.value = withTiming(hiddenOffset, { duration: DUR_MED });
    setTimeout(onClose, SHEET_CLOSE_MS);
  }, [translateX, hiddenOffset, onClose]);

  return { translateX, close };
}
