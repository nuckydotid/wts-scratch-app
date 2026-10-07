import { Platform, Share } from "react-native";
import { WHITE } from "./brand-colors";

export type CaptureAndShareResult = { ok: true } | { ok: false; reason?: unknown };

type NodeRef = { current: unknown } | null;

/**
 * Captures a view (the ID card) to a PNG and shares/downloads it.
 *
 * Native: `react-native-view-shot` capture → RN core `Share` sheet.
 * Web: `html-to-image` (dynamic import — SVG-capable, so the QR serializes
 * correctly) → **download** the PNG by default (works on every browser);
 * the Web Share API is used only when the browser can actually share files,
 * and any share failure falls back to the download — web never errors out
 * after a successful capture.
 *
 * Returns `{ ok }` so the caller can surface an error string; never throws.
 */
export async function captureAndShare(
  nodeRef: NodeRef,
  fileName: string
): Promise<CaptureAndShareResult> {
  if (Platform.OS === "web") {
    return captureAndShareWeb(nodeRef, fileName);
  }
  return captureAndShareNative(nodeRef);
}

async function captureAndShareNative(nodeRef: NodeRef): Promise<CaptureAndShareResult> {
  try {
    const { captureRef } = await import("react-native-view-shot");
    const uri = await captureRef(nodeRef as Parameters<typeof captureRef>[0], {
      format: "png",
      quality: 1,
    });
    await Share.share({ url: uri });
    return { ok: true };
  } catch (reason) {
    return { ok: false, reason };
  }
}

async function captureAndShareWeb(
  nodeRef: NodeRef,
  fileName: string
): Promise<CaptureAndShareResult> {
  try {
    const { toPng } = await import("html-to-image");
    const node = nodeRef?.current as HTMLElement | null | undefined;
    if (!node) return { ok: false, reason: new Error("capture node not found") };
    const baseOptions = {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: WHITE,
      // Cross-origin images (story art, host photos) can fail to inline —
      // without a placeholder html-to-image substitutes `""`, which fires the
      // cloned image's onerror and rejects the capture. A transparent 1x1 PNG
      // keeps the capture going and the failing image just degrades.
      imagePlaceholder:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    } as const;
    let dataUrl: string;
    try {
      // First attempt embeds the document's @font-face fonts (correct typeface)
      // — font embedding is NOT fault-tolerant (embed-webfonts rejects on any
      // fetch failure, e.g. a non-allowlisted origin), so wait for the
      // document's fonts to settle first, then retry without fonts.
      if (typeof document !== "undefined" && typeof document.fonts?.ready?.then === "function") {
        await document.fonts.ready;
      }
      dataUrl = await toPng(node, { ...baseOptions, skipFonts: false });
    } catch {
      dataUrl = await toPng(node, { ...baseOptions, skipFonts: true });
    }
    await shareOrDownloadWeb(dataUrl, fileName);
    return { ok: true };
  } catch (reason) {
    return { ok: false, reason };
  }
}

async function shareOrDownloadWeb(dataUrl: string, fileName: string): Promise<void> {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], fileName, { type: "image/png" });
      const canShare =
        typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });
      if (canShare) {
        await navigator.share({ files: [file], title: fileName });
        return;
      }
    }
  } catch {
    // Share unsupported/denied — fall through to the download.
  }
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}
