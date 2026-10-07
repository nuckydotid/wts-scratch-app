/**
 * BlockMediaPicker — presentational media picker area (image and/or video).
 *
 * The DS block NEVER picks or uploads. The HOST app owns the pipeline:
 *
 *   pick → crop (optional) → upload → publicUrl → state
 *
 * The block signals intent through callbacks:
 *   - `onPickImage(undefined | currentUri)` — user wants to pick a NEW image
 *   - `onPickImage(null)`                    — user wants to REMOVE the media
 *   - `onPickVideo()`                        — user wants to pick a VIDEO
 *
 * ## Integration per platform
 *
 * ### iOS
 * 1. Install `expo-image-picker` and add the config plugin in app.json/app.config.ts
 *    (sets NSPhotoLibraryUsageDescription):
 *    `["expo-image-picker", { photosPermission: "Allow access to photos" }]`
 * 2. On `onPickImage`, call `requestNativePick({ aspectRatio, shape })` from
 *    `lib/native/image-picker.ts` — it requests media-library permission
 *    (`requestMediaLibraryPermissionsAsync`) then launches `launchImageLibraryAsync`.
 *
 * ### Android
 * Same `requestNativePick()` flow. Runtime permission is handled by expo-image-picker;
 * no config plugin entry needed (manifest permission is added automatically).
 *
 * ### Web
 * `requestMediaLibraryPermissionsAsync` auto-grants; `launchImageLibraryAsync` opens the
 * browser file input. No permission setup required.
 *
 * ### Images (all platforms)
 * Send the picked asset through your upload pipeline — uses
 * `uploadAsset({ uri, mimeType }, kind, { onProgress })` from `lib/shared/uploads.ts`
 * (presign POST → PUT bytes to Cloud Storage → returns `{ publicUrl }`). Feed the returned
 * `publicUrl` back into the `photoUrl` prop; set `isUploading` while the upload runs.
 * `UploadKind` values: `"avatar"`, `"galleryImage"`.
 *
 * ### Videos (all platforms)
 * Same picker lib with `mediaTypes: "videos"` (returns `NativePickedImage` incl. duration):
 * `requestNativePick({ mediaTypes: "videos" })`, then
 * `uploadAsset({ uri, mimeType }, "galleryVideo", { onProgress })`.
 * On success, set `videoUrl` to the returned `publicUrl` AND switch `mediaType` to
 * `"video"` (mirrors teacher-gallery-create's `onVideoUploaded` wiring).
 * `videoUrl` must be a direct-playable URL (e.g. Cloud Storage public URL). The preview
 * renders `photoUrl` when set — for a video the host passes a generated
 * first-frame thumbnail as `photoUrl` — and falls back to a video placeholder
 * (play icon) when `mediaType === "video"` without a thumbnail.
 *
 * ### Example host wiring
 * ```tsx
 * const [photoUrl, setPhotoUrl] = useState<string | null>(null);
 * const [videoUrl, setVideoUrl] = useState<string | null>(null);
 * const [mediaType, setMediaType] = useState<"image" | "video">("image");
 * const [isUploading, setIsUploading] = useState(false);
 *
 * const pickImage = async () => {
 *   const picked = await requestNativePick({ shape: "square", aspectRatio: null });
 *   if (!picked) return;                                    // cancelled
 *   setIsUploading(true);
 *   try {
 *     const { publicUrl } = await uploadAsset({ uri: picked.uri, mimeType: picked.mimeType }, "galleryImage");
 *     setPhotoUrl(publicUrl);
 *     setMediaType("image");
 *   } finally { setIsUploading(false); }
 * };
 *
 * const pickVideo = async () => {
 *   const picked = await requestNativePick({ mediaTypes: "videos" });
 *   if (!picked) return;
 *   setIsUploading(true);
 *   try {
 *     const { publicUrl } = await uploadAsset({ uri: picked.uri, mimeType: picked.mimeType ?? "video/mp4" }, "galleryVideo");
 *     setVideoUrl(publicUrl);
 *     setMediaType("video");
 *   } finally { setIsUploading(false); }
 * };
 *
 * <BlockMediaPicker
 *   variant="both"
 *   mediaType={mediaType}
 *   photoUrl={photoUrl}
 *   videoUrl={videoUrl}
 *   isUploading={isUploading}
 *   onPickImage={(uri) => { if (uri === null) { setPhotoUrl(null); setVideoUrl(null); } else pickImage(); }}
 *   onPickVideo={pickVideo}
 * />
 * ```
 *
 * When `requireChangeConfirm` / `requireDeleteConfirm` are enabled, the block opens a
 * confirmation bottom sheet itself (via Teleport) before firing the callbacks.
 * Wrap the screen in `<TeleportProvider>` (or the block falls back to firing directly).
 */
import { testIds } from "@repo/worktrees-studio-shared-ids";
import { useContext } from "react";
import { Image } from "expo-image";
import { UiCard, UiIcon, UiPressable, UiSkeleton, UiText, UiView } from "../heroui-primitive";
import { TeleportContext } from "../teleport";
import { BlockConfirmSheet } from "./block-confirm-sheet";

export type MediaVariant = "image" | "video" | "both";
export type MediaType = "image" | "video" | "camera";

type Props = {
  /** Which pickers the empty state offers. Default "image". */
  variant?: MediaVariant;
  /** Current media type — controls the preview (video placeholder vs image thumbnail) and change action (camera vs video vs image). Default "image". */
  mediaType?: MediaType;
  /** Current image URL — controlled by the host screen. */
  photoUrl?: string | null;
  /** Current video URL — shown as a video placeholder when `mediaType === "video"`. */
  videoUrl?: string | null;
  /** Preview aspect ratio. Defaults to "portrait" (3:4). */
  shape?: "portrait" | "square";
  /** Section title inside the card. Default "Photo". */
  title: string;
  /** Change button label. Default "Change Photo". */
  changeLabel: string;
  /** Change button label when a VIDEO is selected. Defaults to `changeLabel`. */
  videoChangeLabel?: string;
  /** Change button label when a CAMERA capture is selected. Defaults to `changeLabel`. */
  cameraChangeLabel?: string;
  /** Delete button label. Default "Delete". */
  deleteLabel: string;
  /** Upload in progress — dark overlay on the preview and actions disabled. */
  isUploading?: boolean;
  /** Optional 0-100 upload progress — shows a % + progress bar in the overlay (school parity). */
  uploadProgress?: number;
  /** Local URI of the picked file — shown in the preview while uploading (immediate feedback). */
  uploadingUri?: string | null;
  uploadingLabel: string;
  /** Disables all actions (e.g. while the form submits). */
  disabled?: boolean;
  /** Ask for confirmation before replacing the current media. */
  requireChangeConfirm?: boolean;
  /** Ask for confirmation before deleting the media. */
  requireDeleteConfirm?: boolean;
  changeConfirmTitle: string;
  changeConfirmDesc: string;
  changeConfirmAction: string;
  deleteConfirmTitle: string;
  deleteConfirmDesc: string;
  deleteConfirmAction: string;
  /** Cancel label for confirm sheets. Default "Cancel". */
  cancelLabel: string;
  /** Base testID; elements get `{testID}`, `{testID}-change`, `{testID}-delete`, `{testID}-video`. */
  testID?: string;
  /**
   * Image intent callback: `undefined`/current URI = pick a new image, `null` = remove.
   * The host wires pick + upload (see JSDoc header for per-platform guide).
   */
  onPickImage?: (uri?: string | null) => void;
  /** Video intent callback — the host runs pick + upload + sets `mediaType` to "video". */
  onPickVideo?: () => void;
  /**
   * Camera intent callback (still-image capture) — when provided, the empty
   * state adds a camera card. The host owns the permission flow (e.g. opening
   * a permission-preferences sheet) and pick + upload.
   */
  onPickCamera?: () => void;
};

type ConfirmOptions = {
  enabled: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  danger: boolean;
  cancelLabel: string;
  testID?: string;
  confirmTestID?: string;
  run: () => void;
  teleport: NonNullable<React.ContextType<typeof TeleportContext>>;
};

/** Opens the confirm bottom sheet and returns a close callback for the host. */
function openConfirmSheet(options: ConfirmOptions) {
  const sheetId = options.teleport.showBottomSheet(
    <BlockConfirmSheet
      title={options.title}
      description={options.description}
      confirmLabel={options.confirmLabel}
      cancelLabel={options.cancelLabel}
      variant={options.danger ? "danger" : "primary"}
      onConfirm={options.run}
      onClose={() => options.teleport.closeBottomSheet(sheetId)}
      testID={options.testID}
      confirmTestID={options.confirmTestID}
    />
  );
}

export function BlockMediaPicker({
  variant = "image",
  mediaType = "image",
  photoUrl,
  videoUrl,
  shape = "portrait",
  title,
  changeLabel,
  videoChangeLabel,
  deleteLabel,
  uploadingLabel,
  isUploading,
  uploadProgress,
  uploadingUri,
  disabled,
  requireChangeConfirm,
  requireDeleteConfirm,
  changeConfirmTitle,
  changeConfirmDesc,
  changeConfirmAction,
  deleteConfirmTitle,
  deleteConfirmDesc,
  deleteConfirmAction,
  cancelLabel,
  testID,
  onPickImage,
  onPickVideo,
  onPickCamera,
  cameraChangeLabel,
}: Props) {
  const teleport = useContext(TeleportContext);
  const busy = disabled || isUploading;
  const previewSize = 132;
  const hasMedia = !!photoUrl || !!videoUrl;

  const confirmAndRun = (opts: Omit<ConfirmOptions, "teleport" | "cancelLabel">) => {
    if (!opts.enabled || !teleport) {
      opts.run();
      return;
    }
    openConfirmSheet({ ...opts, cancelLabel, teleport });
  };

  const handleChange = () => {
    confirmAndRun({
      enabled: !!requireChangeConfirm,
      title: changeConfirmTitle,
      description: changeConfirmDesc,
      confirmLabel: changeConfirmAction,
      danger: false,
      // Media-aware: replacing a CAMERA capture re-opens the camera,
      // replacing a VIDEO re-opens the video picker (school's per-type change model),
      // and an image re-opens the library picker.
      run: () => {
        if (mediaType === "camera") onPickCamera?.();
        else if (mediaType === "video") onPickVideo?.();
        else onPickImage?.(photoUrl ?? undefined);
      },
    });
  };

  /** Empty-state trigger — nothing to replace yet, so no confirm sheet (school parity). */
  const triggerPick = () => {
    onPickImage?.(undefined);
  };

  const handleDelete = () => {
    confirmAndRun({
      enabled: !!requireDeleteConfirm,
      title: deleteConfirmTitle,
      description: deleteConfirmDesc,
      confirmLabel: deleteConfirmAction,
      danger: true,
      testID: testID ? `${testID}-delete-sheet` : undefined,
      confirmTestID: testID ? testIds.attachment(testID, "delete-confirm") : undefined,
      run: () => onPickImage?.(null),
    });
  };

  const showVideoPreview = mediaType === "video";
  const isCamera = mediaType === "camera";

  const uploadingOverlay = isUploading ? (
    <UiView className="absolute inset-0 bg-black/55 items-center justify-center gap-2 px-5">
      {uploadProgress != null ? (
        <>
          <UiText className="text-white text-sm font-semibold">
            {Math.round(uploadProgress)}%
          </UiText>
          <UiView className="w-full h-1.5 bg-white/25 rounded-full overflow-hidden">
            <UiView
              className="h-full bg-white rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </UiView>
        </>
      ) : (
        <UiText className="text-white text-sm font-semibold">{uploadingLabel}</UiText>
      )}
    </UiView>
  ) : null;

  /** Empty-state trigger card — icon only, same height as the filled preview. */
  const emptyCard = (
    onPress: () => void,
    icon: "image-outline" | "videocam" | "camera-outline",
    testId?: string
  ) => (
    <UiPressable
      testID={testId}
      accessibilityRole="button"
      disabled={busy}
      onPress={onPress}
      className="flex-1 items-center justify-center rounded-2xl border border-dashed border-separator active:opacity-70"
      style={{ minHeight: previewSize }}
    >
      <UiView className="w-16 h-16 rounded-full bg-accent/10 items-center justify-center">
        <UiIcon name={icon} size={30} className="text-accent" />
      </UiView>
    </UiPressable>
  );

  const actionRow = ({
    testId,
    onPress,
    icon,
    tone,
    label,
  }: {
    testId?: string;
    onPress: () => void;
    icon: "camera-outline" | "trash-outline" | "image-outline" | "videocam";
    tone: "accent" | "danger";
    label: string;
  }) => {
    const isDanger = tone === "danger";
    return (
      <UiPressable
        testID={testId}
        accessibilityRole="button"
        disabled={busy}
        onPress={onPress}
        className={`flex-row items-center gap-2.5 rounded-2xl px-3 py-2.5 border border-dashed active:opacity-70 ${
          isDanger ? "border-danger" : "border-accent"
        }`}
      >
        <UiView
          className={`w-8 h-8 rounded-full items-center justify-center shrink-0 ${
            isDanger ? "bg-danger/10" : "bg-accent/10"
          }`}
        >
          <UiIcon name={icon} size={18} className={isDanger ? "text-danger" : "text-accent"} />
        </UiView>
        <UiText
          className={`text-xs font-medium flex-1 text-left ${
            isDanger ? "text-danger" : "text-accent"
          }`}
          numberOfLines={2}
        >
          {label}
        </UiText>
      </UiPressable>
    );
  };

  return (
    <UiCard variant="default" className="p-4 gap-3 mb-4">
      <UiText className="text-xs text-muted-foreground">{title}</UiText>

      {hasMedia || isUploading ? (
        <UiView className="flex-row gap-3">
          <UiView
            testID={testID ? `${testID}-preview` : undefined}
            className="bg-muted items-center justify-center rounded-2xl overflow-hidden"
            style={{ width: previewSize, height: previewSize }}
          >
            {uploadingUri ? (
              <Image
                source={{ uri: uploadingUri }}
                style={{ width: "100%", height: "100%" }}
                contentFit="contain"
                transition={200}
              />
            ) : photoUrl ? (
              <Image
                source={{ uri: photoUrl }}
                style={{ width: "100%", height: "100%" }}
                contentFit="contain"
                transition={200}
              />
            ) : showVideoPreview ? (
              <UiIcon name="videocam" size={40} className="text-muted" />
            ) : isCamera ? (
              <UiIcon name="camera-outline" size={40} className="text-muted" />
            ) : (
              <UiIcon name="image-outline" size={40} className="text-muted" />
            )}
            {uploadingOverlay}
          </UiView>

          <UiView className="flex-1 gap-3 justify-center" style={{ minHeight: previewSize }}>
            {isUploading ? (
              <>
                <UiSkeleton isLoading variant="pulse" className="w-full h-[52px] rounded-2xl" />
                <UiSkeleton isLoading variant="pulse" className="w-full h-[52px] rounded-2xl" />
              </>
            ) : (
              <>
                {actionRow({
                  testId: testID ? testIds.attachment(testID, "change") : undefined,
                  onPress: handleChange,
                  icon: showVideoPreview
                    ? "videocam"
                    : isCamera
                      ? "camera-outline"
                      : "image-outline",
                  tone: "accent",
                  label: showVideoPreview
                    ? (videoChangeLabel ?? changeLabel)
                    : isCamera
                      ? (cameraChangeLabel ?? changeLabel)
                      : changeLabel,
                })}
                {actionRow({
                  testId: testID ? `${testID}-delete` : undefined,
                  onPress: handleDelete,
                  icon: "trash-outline",
                  tone: "danger",
                  label: deleteLabel,
                })}
              </>
            )}
          </UiView>
        </UiView>
      ) : variant === "both" ? (
        <UiView className="flex-row gap-3">
          {emptyCard(triggerPick, "image-outline", testID)}
          {onPickVideo &&
            emptyCard(
              onPickVideo,
              "videocam",
              testID ? testIds.attachment(testID, "video") : undefined
            )}
          {onPickCamera &&
            emptyCard(onPickCamera, "camera-outline", testID ? `${testID}-camera` : undefined)}
        </UiView>
      ) : variant === "video" ? (
        onPickVideo && emptyCard(onPickVideo, "videocam", testID)
      ) : onPickCamera ? (
        <UiView className="flex-row gap-3">
          {emptyCard(triggerPick, "image-outline", testID)}
          {emptyCard(onPickCamera, "camera-outline", testID ? `${testID}-camera` : undefined)}
        </UiView>
      ) : (
        emptyCard(triggerPick, "image-outline", testID)
      )}
    </UiCard>
  );
}
