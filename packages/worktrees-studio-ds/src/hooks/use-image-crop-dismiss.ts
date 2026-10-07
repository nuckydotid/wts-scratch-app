import { useRef, useState } from "react";
import { CROP_DISMISS_MS } from "../lib/timing";

export type ImageCropAsset<TExtra = object> = {
  uri: string;
  width: number;
  height: number;
} & TExtra;

export function useImageCropDismiss<TExtra = object>() {
  const [cropAsset, setCropAsset] = useState<ImageCropAsset<TExtra> | null>(null);
  const [cropVisible, setCropVisible] = useState(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openCrop = (asset: ImageCropAsset<TExtra>) => {
    setCropAsset(asset);
    setCropVisible(true);
  };

  const dismissCrop = (afterDismiss?: () => void) => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    setCropVisible(false);
    dismissTimerRef.current = setTimeout(() => {
      setCropAsset(null);
      afterDismiss?.();
      dismissTimerRef.current = null;
    }, CROP_DISMISS_MS);
  };

  return {
    cropAsset,
    cropVisible,
    openCrop,
    dismissCrop,
  };
}
