import { render, userEvent } from "@testing-library/react-native";
import { BlockMediaPicker } from "../block-media-picker";
import { TeleportProvider } from "../../teleport";

const COPY = {
  title: "Photo",
  changeLabel: "Change Photo",
  deleteLabel: "Delete",
  uploadingLabel: "Uploading…",
  changeConfirmTitle: "Replace Media?",
  changeConfirmDesc: "The current media will be replaced with a new one.",
  changeConfirmAction: "Yes, Replace",
  deleteConfirmTitle: "Delete Media?",
  deleteConfirmDesc: "This media will be removed.",
  deleteConfirmAction: "Delete",
  cancelLabel: "Cancel",
};

describe("BlockMediaPicker", () => {
  it("renders the empty state as an icon-only card", async () => {
    const r = await render(<BlockMediaPicker {...COPY} testID="media" onPickImage={() => {}} />);
    expect(r.getByTestId("media")).toBeTruthy();
    expect(r.queryByText("Upload Photo")).toBeNull();
    expect(JSON.stringify(r.toJSON())).toContain("image-outline");
  });

  it("renders image + video empty cards for the both variant", async () => {
    const { getByTestId } = await render(
      <BlockMediaPicker
        {...COPY}
        variant="both"
        testID="media"
        onPickImage={() => {}}
        onPickVideo={() => {}}
      />
    );
    expect(getByTestId("media")).toBeTruthy();
    expect(getByTestId("media-video")).toBeTruthy();
  });

  it("opens the picker directly from the empty state (no confirm sheet)", async () => {
    const onPickImage = jest.fn();
    const { getByTestId } = await render(
      <BlockMediaPicker
        {...COPY}
        testID="media"
        requireChangeConfirm
        changeConfirmTitle="Replace Photo?"
        onPickImage={onPickImage}
      />
    );
    const user = userEvent.setup();
    await user.press(getByTestId("media"));
    expect(onPickImage).toHaveBeenCalledWith(undefined);
  });

  it("fires the video intent from the empty video card", async () => {
    const onPickVideo = jest.fn();
    const { getByTestId } = await render(
      <BlockMediaPicker
        {...COPY}
        variant="both"
        testID="media"
        onPickImage={() => {}}
        onPickVideo={onPickVideo}
      />
    );
    const user = userEvent.setup();
    await user.press(getByTestId("media-video"));
    expect(onPickVideo).toHaveBeenCalled();
  });

  it("shows the preview with change/delete actions in the filled state", async () => {
    const onPickImage = jest.fn();
    const { getByTestId } = await render(
      <BlockMediaPicker
        {...COPY}
        testID="media"
        photoUrl="https://cdn/a.jpg"
        changeLabel="Change Photo"
        deleteLabel="Delete Photo"
        onPickImage={onPickImage}
      />
    );
    const user = userEvent.setup();
    await user.press(getByTestId("media-change"));
    expect(onPickImage).toHaveBeenCalledWith("https://cdn/a.jpg");
    await user.press(getByTestId("media-delete"));
    expect(onPickImage).toHaveBeenCalledWith(null);
  });

  it("shows the upload overlay with progress when uploading", async () => {
    const { getByText } = await render(
      <BlockMediaPicker
        {...COPY}
        testID="media"
        photoUrl="https://cdn/a.jpg"
        isUploading
        uploadProgress={45}
        onPickImage={() => {}}
      />
    );
    expect(getByText("45%")).toBeTruthy();
  });

  it("shows the uploading text without a progress value", async () => {
    const { getByText } = await render(
      <BlockMediaPicker
        {...COPY}
        testID="media"
        photoUrl="https://cdn/a.jpg"
        isUploading
        onPickImage={() => {}}
      />
    );
    expect(getByText("Uploading…")).toBeTruthy();
  });

  it("opens a confirm sheet before replacing when required", async () => {
    const onPickImage = jest.fn();
    const { getByTestId, getByText } = await render(
      <TeleportProvider>
        <BlockMediaPicker
          {...COPY}
          testID="media"
          photoUrl="https://cdn/a.jpg"
          requireChangeConfirm
          changeConfirmTitle="Replace Photo?"
          changeConfirmAction="Yes, Replace"
          onPickImage={onPickImage}
        />
      </TeleportProvider>
    );
    const user = userEvent.setup();
    await user.press(getByTestId("media-change"));
    expect(getByText("Replace Photo?")).toBeTruthy();
    await user.press(getByText("Yes, Replace"));
    expect(onPickImage).toHaveBeenCalledWith("https://cdn/a.jpg");
  });

  it("opens a confirm sheet with shared testIDs before deleting when required", async () => {
    const onPickImage = jest.fn();
    const { getByTestId, getByText } = await render(
      <TeleportProvider>
        <BlockMediaPicker
          {...COPY}
          testID="media"
          photoUrl="https://cdn/a.jpg"
          requireDeleteConfirm
          deleteConfirmTitle="Delete Media?"
          deleteConfirmAction="Delete"
          onPickImage={onPickImage}
        />
      </TeleportProvider>
    );
    const user = userEvent.setup();
    await user.press(getByTestId("media-delete"));
    expect(getByTestId("media-delete-sheet")).toBeTruthy();
    expect(getByTestId("media-delete-confirm")).toBeTruthy();
    await user.press(getByTestId("media-delete-confirm"));
    expect(onPickImage).toHaveBeenCalledWith(null);
  });

  it("shows skeleton action rows while uploading", async () => {
    const onPickImage = jest.fn();
    const r = await render(
      <BlockMediaPicker
        {...COPY}
        testID="media"
        photoUrl="https://cdn/a.jpg"
        isUploading
        onPickImage={onPickImage}
      />
    );
    expect(r.queryByTestId("media-change")).toBeNull();
    expect(r.queryByTestId("media-delete")).toBeNull();
    expect(JSON.stringify(r.toJSON()).match(/pulse/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
  });

  it("keeps the empty state the same height as the filled preview", async () => {
    const empty = await render(
      <BlockMediaPicker {...COPY} testID="media" onPickImage={() => {}} />
    );
    expect(empty.getByTestId("media").props.style.minHeight).toBe(132);

    const filled = await render(
      <BlockMediaPicker
        {...COPY}
        testID="media"
        photoUrl="https://cdn/a.jpg"
        onPickImage={() => {}}
      />
    );
    expect(filled.getByTestId("media-preview").props.style.height).toBe(132);
  });

  it("shows an upload placeholder with progress when uploading from the empty state", async () => {
    const r = await render(
      <BlockMediaPicker
        {...COPY}
        testID="media"
        isUploading
        uploadProgress={45}
        onPickImage={() => {}}
      />
    );
    expect(r.getByTestId("media-preview")).toBeTruthy();
    expect(r.getByText("45%")).toBeTruthy();
  });

  it("shows the picked file in the preview while uploading (uploadingUri)", async () => {
    const r = await render(
      <BlockMediaPicker
        {...COPY}
        testID="media"
        isUploading
        uploadingUri="file:///picked.jpg"
        onPickImage={() => {}}
      />
    );
    expect(JSON.stringify(r.toJSON())).toContain("file:///picked.jpg");
  });

  it("prefers the video thumbnail (photoUrl) over the videocam placeholder", async () => {
    const r = await render(
      <BlockMediaPicker
        {...COPY}
        testID="media"
        mediaType="video"
        videoUrl="https://cdn/v.mp4"
        photoUrl="file:///thumb.jpg"
        onPickImage={() => {}}
      />
    );
    expect(JSON.stringify(r.toJSON())).toContain("file:///thumb.jpg");
  });

  it("falls back to the videocam placeholder for a video without a thumbnail", async () => {
    const r = await render(
      <BlockMediaPicker
        {...COPY}
        testID="media"
        mediaType="video"
        videoUrl="https://cdn/v.mp4"
        onPickImage={() => {}}
      />
    );
    expect(JSON.stringify(r.toJSON())).toContain("videocam");
  });

  it("routes the change action to the video picker for a selected video", async () => {
    const user = userEvent.setup();
    const onPickImage = jest.fn();
    const onPickVideo = jest.fn();
    const r = await render(
      <BlockMediaPicker
        {...COPY}
        testID="media"
        mediaType="video"
        videoUrl="https://cdn/v.mp4"
        onPickImage={onPickImage}
        onPickVideo={onPickVideo}
      />
    );
    await user.press(r.getByTestId("media-change"));
    expect(onPickVideo).toHaveBeenCalledTimes(1);
    expect(onPickImage).not.toHaveBeenCalled();
    // The change row uses the VIDEO icon (like the empty-state video card).
    expect(JSON.stringify(r.toJSON())).toContain("videocam");
  });

  it("still routes the change action to the image picker for a selected image", async () => {
    const user = userEvent.setup();
    const onPickImage = jest.fn();
    const onPickVideo = jest.fn();
    const r = await render(
      <BlockMediaPicker
        {...COPY}
        testID="media"
        mediaType="image"
        photoUrl="https://cdn/a.jpg"
        onPickImage={onPickImage}
        onPickVideo={onPickVideo}
      />
    );
    await user.press(r.getByTestId("media-change"));
    expect(onPickVideo).not.toHaveBeenCalled();
    expect(onPickImage).toHaveBeenCalledTimes(1);
    // The change row uses the GALLERY (image) icon, like the empty-state card.
    expect(JSON.stringify(r.toJSON())).toContain("image-outline");
  });

  it("shows the video change label for a selected video", async () => {
    const r = await render(
      <BlockMediaPicker
        {...COPY}
        testID="media"
        mediaType="video"
        videoUrl="https://cdn/v.mp4"
        changeLabel="Change Photo"
        videoChangeLabel="Change Video"
        onPickImage={() => {}}
        onPickVideo={() => {}}
      />
    );
    expect(r.getByText("Change Video")).toBeTruthy();
  });

  it("falls back to the default change label when no video label is given", async () => {
    const r = await render(
      <BlockMediaPicker
        {...COPY}
        testID="media"
        mediaType="video"
        videoUrl="https://cdn/v.mp4"
        changeLabel="Change Photo"
        onPickImage={() => {}}
        onPickVideo={() => {}}
      />
    );
    expect(r.getByText("Change Photo")).toBeTruthy();
  });

  it("renders image + video + camera empty cards when onPickCamera is provided on variant both", async () => {
    const onPickCamera = jest.fn();
    const { getByTestId } = await render(
      <BlockMediaPicker
        {...COPY}
        variant="both"
        testID="media"
        onPickImage={() => {}}
        onPickVideo={() => {}}
        onPickCamera={onPickCamera}
      />
    );
    expect(getByTestId("media")).toBeTruthy();
    expect(getByTestId("media-video")).toBeTruthy();
    expect(getByTestId("media-camera")).toBeTruthy();

    const user = userEvent.setup();
    await user.press(getByTestId("media-camera"));
    expect(onPickCamera).toHaveBeenCalledTimes(1);
  });

  it("renders image + camera empty cards when onPickCamera is provided on variant image", async () => {
    const onPickCamera = jest.fn();
    const { getByTestId, queryByTestId } = await render(
      <BlockMediaPicker
        {...COPY}
        variant="image"
        testID="media"
        onPickImage={() => {}}
        onPickCamera={onPickCamera}
      />
    );
    expect(getByTestId("media")).toBeTruthy();
    expect(getByTestId("media-camera")).toBeTruthy();
    expect(queryByTestId("media-video")).toBeNull();

    const user = userEvent.setup();
    await user.press(getByTestId("media-camera"));
    expect(onPickCamera).toHaveBeenCalledTimes(1);
  });

  it("does not render camera card when onPickCamera is not provided", async () => {
    const { queryByTestId } = await render(
      <BlockMediaPicker
        {...COPY}
        variant="both"
        testID="media"
        onPickImage={() => {}}
        onPickVideo={() => {}}
      />
    );
    expect(queryByTestId("media-camera")).toBeNull();
  });

  it("routes the change action to the camera picker for mediaType camera", async () => {
    const user = userEvent.setup();
    const onPickImage = jest.fn();
    const onPickVideo = jest.fn();
    const onPickCamera = jest.fn();
    const r = await render(
      <BlockMediaPicker
        {...COPY}
        testID="media"
        mediaType="camera"
        photoUrl="https://cdn/shot.jpg"
        cameraChangeLabel="Retake Photo"
        onPickImage={onPickImage}
        onPickVideo={onPickVideo}
        onPickCamera={onPickCamera}
      />
    );
    expect(r.getByText("Retake Photo")).toBeTruthy();
    expect(JSON.stringify(r.toJSON())).toContain("camera-outline");

    await user.press(r.getByTestId("media-change"));
    expect(onPickCamera).toHaveBeenCalledTimes(1);
    expect(onPickImage).not.toHaveBeenCalled();
    expect(onPickVideo).not.toHaveBeenCalled();
  });

  it("falls back to the default change label for mediaType camera when no camera label is given", async () => {
    const r = await render(
      <BlockMediaPicker
        {...COPY}
        testID="media"
        mediaType="camera"
        photoUrl="https://cdn/shot.jpg"
        changeLabel="Change Photo"
        onPickImage={() => {}}
        onPickCamera={() => {}}
      />
    );
    expect(r.getByText("Change Photo")).toBeTruthy();
    expect(JSON.stringify(r.toJSON())).toContain("camera-outline");
  });
});
