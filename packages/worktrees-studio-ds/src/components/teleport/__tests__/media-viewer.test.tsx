import { act, userEvent, render } from "@testing-library/react-native";
import { Text } from "react-native";
import { TeleportProvider, useTeleport } from "../index";

function MediaViewerImageProbe() {
  const teleport = useTeleport();
  return (
    <Text
      testID="open-image-viewer"
      onPress={() =>
        teleport.showMediaViewer({
          uri: "https://cdn.example.com/photo.jpg",
          mediaType: "image",
          testID: "probe-media-viewer",
        })
      }
    >
      open image
    </Text>
  );
}

function MediaViewerVideoProbe() {
  const teleport = useTeleport();
  return (
    <Text
      testID="open-video-viewer"
      onPress={() =>
        teleport.showMediaViewer({
          uri: "https://cdn.example.com/video.mp4",
          mediaType: "video",
          testID: "probe-video-viewer",
        })
      }
    >
      open video
    </Text>
  );
}

describe("TeleportMediaViewer", () => {
  it("renders the fullscreen image viewer with pinch gesture support and close button", async () => {
    const r = await render(
      <TeleportProvider>
        <MediaViewerImageProbe />
      </TeleportProvider>
    );
    const user = userEvent.setup();
    await user.press(r.getByTestId("open-image-viewer"));
    await act(async () => {});

    expect(r.getByTestId("probe-media-viewer")).toBeTruthy();
    expect(r.getByTestId("media-viewer-close")).toBeTruthy();

    await user.press(r.getByTestId("media-viewer-close"));
    await act(async () => {});
    expect(r.queryByTestId("probe-media-viewer")).toBeNull();
  });

  it("renders the video viewer with video player", async () => {
    const r = await render(
      <TeleportProvider>
        <MediaViewerVideoProbe />
      </TeleportProvider>
    );
    const user = userEvent.setup();
    await user.press(r.getByTestId("open-video-viewer"));
    await act(async () => {});

    expect(r.getByTestId("probe-video-viewer")).toBeTruthy();
    expect(r.getByTestId("probe-video-viewer-video")).toBeTruthy();
  });
});
