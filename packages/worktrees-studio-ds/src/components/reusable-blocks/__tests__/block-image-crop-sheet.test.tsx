import type { ComponentProps } from "react";
import { userEvent, render } from "@testing-library/react-native";
import { ImageManipulator } from "expo-image-manipulator";
import { BlockImageCropSheet } from "../block-image-crop-sheet";

const mockManipulate = ImageManipulator.manipulate as jest.Mock;

function renderCrop(props: Partial<ComponentProps<typeof BlockImageCropSheet>> = {}) {
  return render(
    <BlockImageCropSheet
      title="Crop Image"
      confirmLabel="Done"
      cancelLabel="Cancel"
      ratioFreeLabel="Free"
      visible
      uri="file://src.jpg"
      sourceWidth={1200}
      sourceHeight={1600}
      shape="portrait"
      aspectRatio={[3, 4]}
      maxDimension={512}
      onConfirm={jest.fn()}
      onCancel={jest.fn()}
      {...props}
    />
  );
}

describe("BlockImageCropSheet", () => {
  beforeEach(() => {
    mockManipulate.mockClear();
  });

  it("renders the crop editor and cancels without cropping", async () => {
    const onCancel = jest.fn();
    const r = await renderCrop({ onCancel });
    expect(r.getByTestId("crop-cancel")).toBeOnTheScreen();
    expect(r.getByTestId("crop-confirm")).toBeOnTheScreen();

    await userEvent.press(r.getByTestId("crop-cancel"));
    expect(onCancel).toHaveBeenCalled();
    expect(mockManipulate).not.toHaveBeenCalled();
  });

  it("crops via ImageManipulator and reports the asset on confirm", async () => {
    const onConfirm = jest.fn();
    const r = await renderCrop({ onConfirm });

    await userEvent.press(r.getByTestId("crop-confirm"));

    expect(mockManipulate).toHaveBeenCalledTimes(1);
    expect(mockManipulate).toHaveBeenCalledWith("file://src.jpg");
    const context = mockManipulate.mock.results[0].value;
    expect(context.crop).toHaveBeenCalledWith(
      expect.objectContaining({
        originX: expect.any(Number),
        originY: expect.any(Number),
        width: expect.any(Number),
        height: expect.any(Number),
      })
    );
    expect(context.resize).toHaveBeenCalledWith(
      expect.objectContaining({
        width: expect.any(Number),
        height: expect.any(Number),
      })
    );
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        uri: "file://cropped.jpg",
        width: 300,
        height: 400,
        mimeType: "image/jpeg",
        base64: "abc",
      })
    );
  });

  it("does not render content when hidden", async () => {
    const r = await renderCrop({ visible: false });
    expect(r.queryByTestId("crop-confirm")).not.toBeOnTheScreen();
    expect(r.queryByTestId("crop-cancel")).not.toBeOnTheScreen();
  });

  it("hides the ratio bar when a ratio is locked", async () => {
    const r = await renderCrop({ aspectRatio: [3, 4] });
    expect(r.queryByText("Free")).not.toBeOnTheScreen();
    expect(r.queryByText("1:1")).not.toBeOnTheScreen();
    expect(r.queryByText("3:4")).not.toBeOnTheScreen();
    expect(r.queryByText("16:9")).not.toBeOnTheScreen();
  });

  it("shows the ratio bar for a free crop", async () => {
    const r = await renderCrop({ aspectRatio: null });
    expect(r.getByText("Free")).toBeOnTheScreen();
    expect(r.getByText("1:1")).toBeOnTheScreen();
    expect(r.getByText("3:4")).toBeOnTheScreen();
    expect(r.getByText("16:9")).toBeOnTheScreen();
  });
});
