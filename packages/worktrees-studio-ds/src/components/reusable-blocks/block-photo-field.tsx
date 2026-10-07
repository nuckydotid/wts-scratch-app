/**
 * BlockPhotoField — self-contained photo field for sheet forms.
 *
 * WHY THIS EXISTS: full-sheet content is captured as a frozen React element
 * when `showFullSheet` is called — host state changes never reach an open
 * sheet. A photo field must therefore OWN its state inside the sheet (like
 * the app's `ProfilePhotoSheet`): it picks → crops (Modal crop,
 * kept mounted through its close animation) → uploads via the host-injected
 * `onUploadRequest` (the DS has no API client) → updates its preview live
 * and reports every change through `onPhotoChange` so the sheet's submit can
 * read the CURRENT url via a shared ref.
 */
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";

import { BlockMediaPicker } from "./block-media-picker";
import { useImageCropDismiss } from "../../hooks/use-image-crop-dismiss";
import { BlockImageCropSheet, type CroppedImageAsset } from "./block-image-crop-sheet";

export type BlockPhotoFieldTexts = {
  mediaPicker: {
    title: string;
    changeLabel: string;
    deleteLabel: string;
    uploadingLabel: string;
    changeConfirmTitle: string;
    changeConfirmDesc: string;
    changeConfirmAction: string;
    deleteConfirmTitle: string;
    deleteConfirmDesc: string;
    deleteConfirmAction: string;
    cancelLabel: string;
  };
  crop: {
    title: string;
    confirmLabel: string;
    cancelLabel: string;
    ratioFreeLabel: string;
  };
  permissionError: string;
};

export interface BlockPhotoFieldProps {
  /** Photo shown when the sheet opens (e.g. the student's existing photo). */
  initialPhotoUrl?: string | null;
  texts: BlockPhotoFieldTexts;
  shape: "portrait" | "square";
  aspectRatio: [number, number];
  maxDimension?: number;
  disabled?: boolean;
  /** Base testID — the media picker gets `{testID}`, `{testID}-change`, `{testID}-delete`. */
  testID?: string;
  /**
   * Host-injected pick override — used instead of the internal
   * expo-image-picker flow (e2e mock pickers, unit tests). Resolves with the
   * picked asset, or null when the user cancels.
   */
  pickImage?: () => Promise<{ uri: string; width: number; height: number } | null>;
  /** Uploads the cropped asset and resolves with the public URL. */
  onUploadRequest: (asset: CroppedImageAsset) => Promise<string>;
  /** Reports every photo change (upload or delete) — hosts mirror it into a ref. */
  onPhotoChange: (publicUrl: string | null) => void;
  onUploadError?: (error: unknown) => void;
}

export function BlockPhotoField({
  initialPhotoUrl,
  texts,
  shape,
  aspectRatio,
  maxDimension = 512,
  disabled,
  testID,
  pickImage,
  onUploadRequest,
  onPhotoChange,
  onUploadError,
}: BlockPhotoFieldProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhotoUrl ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingUri, setPendingUri] = useState<string | null>(null);
  const { cropAsset, cropVisible, openCrop, dismissCrop } = useImageCropDismiss();

  const handlePick = async () => {
    try {
      const picked = pickImage ? await pickImage() : await pickFromLibrary();
      if (!picked) return;
      openCrop({
        uri: picked.uri,
        width: picked.width,
        height: picked.height,
      });
    } catch (e) {
      onUploadError?.(e);
    }
  };

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      throw new Error(texts.permissionError);
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets?.[0]) return null;
    const asset = result.assets[0];
    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
    };
  };

  const handleCropConfirm = async (asset: CroppedImageAsset) => {
    setPendingUri(asset.uri);
    setIsUploading(true);
    try {
      const publicUrl = await onUploadRequest(asset);
      setPhotoUrl(publicUrl);
      onPhotoChange(publicUrl);
    } catch (e) {
      onUploadError?.(e);
    } finally {
      setIsUploading(false);
      setPendingUri(null);
    }
  };

  const handleDelete = () => {
    setPhotoUrl(null);
    onPhotoChange(null);
  };

  return (
    <>
      <BlockMediaPicker
        testID={testID}
        shape={shape}
        photoUrl={photoUrl}
        uploadingUri={pendingUri}
        isUploading={isUploading}
        title={texts.mediaPicker.title}
        changeLabel={texts.mediaPicker.changeLabel}
        deleteLabel={texts.mediaPicker.deleteLabel}
        uploadingLabel={texts.mediaPicker.uploadingLabel}
        changeConfirmTitle={texts.mediaPicker.changeConfirmTitle}
        changeConfirmDesc={texts.mediaPicker.changeConfirmDesc}
        changeConfirmAction={texts.mediaPicker.changeConfirmAction}
        deleteConfirmTitle={texts.mediaPicker.deleteConfirmTitle}
        deleteConfirmDesc={texts.mediaPicker.deleteConfirmDesc}
        deleteConfirmAction={texts.mediaPicker.deleteConfirmAction}
        cancelLabel={texts.mediaPicker.cancelLabel}
        disabled={disabled}
        onPickImage={(uri) => {
          if (uri === null) {
            handleDelete();
          } else {
            void handlePick();
          }
        }}
      />
      {cropAsset && (
        <BlockImageCropSheet
          visible={cropVisible}
          uri={cropAsset.uri}
          sourceWidth={cropAsset.width}
          sourceHeight={cropAsset.height}
          shape={shape}
          aspectRatio={aspectRatio}
          maxDimension={maxDimension}
          title={texts.crop.title}
          confirmLabel={texts.crop.confirmLabel}
          cancelLabel={texts.crop.cancelLabel}
          ratioFreeLabel={texts.crop.ratioFreeLabel}
          onConfirm={(cropped) => dismissCrop(() => void handleCropConfirm(cropped))}
          onCancel={() => dismissCrop(() => {})}
        />
      )}
    </>
  );
}
