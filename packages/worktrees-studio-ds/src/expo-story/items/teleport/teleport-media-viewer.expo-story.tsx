import { useCallback } from "react";
import { UiView, UiText, UiButton } from "../../../components";
import { TeleportProvider, useTeleport } from "../../../components/teleport";
import type { ComponentDef } from "./index";

function MediaViewerDemo(props: { video?: boolean }) {
  const { showMediaViewer } = useTeleport();

  const openViewer = useCallback(() => {
    showMediaViewer({
      uri: props.video
        ? "https://example.com/video.mp4"
        : "https://placehold.co/800x800/079789/fff?text=Foto+Pinch+Zoom",
      mediaType: props.video ? "video" : "image",
    });
  }, [props.video, showMediaViewer]);

  return (
    <UiView className="flex-1 items-center justify-center p-6 gap-4">
      <UiText className="text-lg font-bold text-foreground">TeleportMediaViewer</UiText>
      <UiText className="text-sm text-muted text-center">
        {props.video
          ? "Opens video in fullscreen media viewer"
          : "Opens image in fullscreen media viewer with pinch-to-zoom & pan gestures"}
      </UiText>
      <UiButton variant="primary" size="md" onPress={openViewer}>
        {props.video ? "View Video Fullscreen" : "View Image (Pinch to Zoom)"}
      </UiButton>
    </UiView>
  );
}

export const TeleportMediaViewerBlock: ComponentDef = {
  label: "TeleportMediaViewer",
  category: "teleport",
  controls: {
    video: { type: "boolean", default: false },
  },
  render: (p) => (
    <TeleportProvider>
      <MediaViewerDemo video={Boolean(p.video)} />
    </TeleportProvider>
  ),
};
