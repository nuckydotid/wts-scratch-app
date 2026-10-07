import { act, userEvent, render } from "@testing-library/react-native";
import { ImageManipulator } from "expo-image-manipulator";
import { BlockPhotoField } from "../block-photo-field";

const mockManipulate = ImageManipulator.manipulate as jest.Mock;
const mockPerm = jest.requireMock("expo-image-picker")
  .requestMediaLibraryPermissionsAsync as jest.Mock;
const mockPick = jest.requireMock("expo-image-picker").launchImageLibraryAsync as jest.Mock;

function renderField(props: Partial<React.ComponentProps<typeof BlockPhotoField>> = {}) {
  return render(
    <BlockPhotoField
      texts={{
        mediaPicker: {
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
        },
        crop: {
          title: "Crop Image",
          confirmLabel: "Done",
          cancelLabel: "Cancel",
          ratioFreeLabel: "Free",
        },
        permissionError: "Media library permission not granted",
      }}
      testID="photo-field"
      shape="portrait"
      aspectRatio={[3, 4]}
      maxDimension={512}
      onUploadRequest={jest.fn(async () => "https://cdn/p.jpg")}
      onPhotoChange={jest.fn()}
      {...props}
    />
  );
}

describe("BlockPhotoField", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerm.mockResolvedValue({ status: "granted" });
    mockPick.mockResolvedValue({
      canceled: false,
      assets: [
        {
          uri: "file://picked.jpg",
          width: 1200,
          height: 1600,
          mimeType: "image/jpeg",
          fileName: "p.jpg",
          fileSize: 100,
        },
      ],
    });
  });

  it("picks, crops, uploads and updates the preview live", async () => {
    jest.useFakeTimers();
    const onUploadRequest = jest.fn(async () => "https://cdn/p.jpg");
    const onPhotoChange = jest.fn();
    const r = await renderField({ onUploadRequest, onPhotoChange });

    // Empty-state card → picker (mocked) → crop Modal opens.
    await userEvent.press(r.getByTestId("photo-field"));
    await act(async () => {});
    expect(r.getByTestId("crop-confirm")).toBeOnTheScreen();

    // Confirm → crop (manipulator) → 350ms Modal dismissal → upload → live preview.
    await userEvent.press(r.getByTestId("crop-confirm"));
    await act(async () => {});
    await act(async () => {
      jest.advanceTimersByTime(400);
    });

    expect(mockManipulate).toHaveBeenCalledTimes(1);
    expect(onUploadRequest).toHaveBeenCalledWith(
      expect.objectContaining({ uri: "file://cropped.jpg", mimeType: "image/jpeg" })
    );
    expect(onPhotoChange).toHaveBeenCalledWith("https://cdn/p.jpg");
    expect(r.getByTestId("photo-field-change")).toBeOnTheScreen();
    expect(r.getByTestId("photo-field-delete")).toBeOnTheScreen();
    jest.useRealTimers();
  });

  it("deletes the photo and reports null", async () => {
    const onPhotoChange = jest.fn();
    const r = await renderField({ initialPhotoUrl: "https://cdn/old.jpg", onPhotoChange });

    expect(r.getByTestId("photo-field-change")).toBeOnTheScreen();
    await userEvent.press(r.getByTestId("photo-field-delete"));

    expect(onPhotoChange).toHaveBeenCalledWith(null);
    expect(r.queryByTestId("photo-field-change")).not.toBeOnTheScreen();
  });

  it("uses the injected pickImage instead of the system picker", async () => {
    jest.useFakeTimers();
    const pickImage = jest.fn(async () => ({
      uri: "file://injected.jpg",
      width: 960,
      height: 1280,
    }));
    const onUploadRequest = jest.fn(async () => "https://cdn/p.jpg");
    const onPhotoChange = jest.fn();
    const r = await renderField({ pickImage, onUploadRequest, onPhotoChange });

    await userEvent.press(r.getByTestId("photo-field"));
    await act(async () => {});

    expect(mockPick).not.toHaveBeenCalled();
    expect(r.getByTestId("crop-confirm")).toBeOnTheScreen();

    await userEvent.press(r.getByTestId("crop-confirm"));
    await act(async () => {});
    await act(async () => {
      jest.advanceTimersByTime(400);
    });

    expect(onUploadRequest).toHaveBeenCalledWith(
      expect.objectContaining({ uri: "file://cropped.jpg", mimeType: "image/jpeg" })
    );
    expect(onPhotoChange).toHaveBeenCalledWith("https://cdn/p.jpg");
    jest.useRealTimers();
  });

  it("reports picker permission failures through onUploadError", async () => {
    mockPerm.mockResolvedValue({ status: "denied" });
    const onUploadError = jest.fn();
    const r = await renderField({ onUploadError });

    await userEvent.press(r.getByTestId("photo-field"));
    await act(async () => {});

    expect(onUploadError).toHaveBeenCalledWith(expect.any(Error));
    expect(r.queryByTestId("crop-confirm")).not.toBeOnTheScreen();
  });
});
