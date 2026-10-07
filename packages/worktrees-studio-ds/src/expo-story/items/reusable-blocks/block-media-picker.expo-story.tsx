import { UiView } from "../../../components";
import { BlockMediaPicker } from "../../../components/reusable-blocks";
import { TeleportProvider } from "../../../components/teleport";
import type { ComponentDef } from "./index";
import * as C from "../heroui-primitive/controls";

export const BlockMediaPickerBlock: ComponentDef = {
  label: "BlockMediaPicker",
  category: "reusable blocks",
  controls: {
    title: C.txt("Photo"),
    variant: C.select(["image", "video", "both"], "image"),
    mediaType: C.select(["image", "video"], "image"),
    hasPhoto: C.bool(false),
    hasVideo: C.bool(false),
    isUploading: C.bool(false),
    uploadProgress: C.select(["none", "25", "50", "75", "100"], "none"),
    showUploadingUri: C.bool(false),
    disabled: C.bool(false),
    requireChangeConfirm: C.bool(false),
    requireDeleteConfirm: C.bool(false),
    changeLabel: C.txt("Change Photo"),
    uploadingLabel: C.txt("Uploading..."),
    deleteLabel: C.txt("Delete Photo"),
    changeConfirmTitle: C.txt("Replace Photo?"),
    changeConfirmDesc: C.txt("The current photo will be replaced with a new one."),
    changeConfirmAction: C.txt("Yes, Replace"),
    deleteConfirmTitle: C.txt("Delete Photo?"),
    deleteConfirmDesc: C.txt("Your photo will be removed."),
    deleteConfirmAction: C.txt("Yes, Delete"),
    cancelLabel: C.txt("Cancel"),
  },
  render: (p) => {
    const hasPhoto = Boolean(p.hasPhoto);
    const hasVideo = Boolean(p.hasVideo);
    const mediaType = hasVideo && !hasPhoto ? "video" : (p.mediaType as "image" | "video");
    const uploadProgress = p.uploadProgress === "none" ? undefined : Number(p.uploadProgress);

    return (
      <TeleportProvider>
        <UiView className="flex-1 items-center justify-center p-6">
          <UiView className="w-full max-w-md">
            <BlockMediaPicker
              title={p.title as string}
              changeLabel={p.changeLabel as string}
              deleteLabel={p.deleteLabel as string}
              uploadingLabel={p.uploadingLabel as string}
              changeConfirmTitle={p.changeConfirmTitle as string}
              changeConfirmDesc={p.changeConfirmDesc as string}
              changeConfirmAction={p.changeConfirmAction as string}
              deleteConfirmTitle={p.deleteConfirmTitle as string}
              deleteConfirmDesc={p.deleteConfirmDesc as string}
              deleteConfirmAction={p.deleteConfirmAction as string}
              cancelLabel={p.cancelLabel as string}
              variant={p.variant as any}
              mediaType={mediaType}
              photoUrl={hasPhoto ? "https://i.pravatar.cc/132?img=32" : null}
              videoUrl={hasVideo ? "https://example.com/video.mp4" : null}
              isUploading={Boolean(p.isUploading)}
              uploadProgress={uploadProgress}
              uploadingUri={p.showUploadingUri ? "https://i.pravatar.cc/132?img=12" : null}
              disabled={Boolean(p.disabled)}
              requireChangeConfirm={Boolean(p.requireChangeConfirm)}
              requireDeleteConfirm={Boolean(p.requireDeleteConfirm)}
              testID="media-picker"
              onPickImage={() => {}}
              onPickVideo={() => {}}
            />
          </UiView>
        </UiView>
      </TeleportProvider>
    );
  },
};
