import { render, fireEvent } from "@testing-library/react-native";
import { BlockConfirmSheet } from "../block-confirm-sheet";

describe("BlockConfirmSheet", () => {
  it("renders title, description and handles confirm and cancel callbacks with testIDs", async () => {
    const onConfirm = jest.fn();
    const onClose = jest.fn();

    const { getByTestId, getByText } = await render(
      <BlockConfirmSheet
        title="Konfirmasi"
        description="Apakah Anda yakin?"
        confirmLabel="Ya, Lanjutkan"
        cancelLabel="Batal"
        testID="confirm-sheet"
        confirmTestID="confirm-btn"
        cancelTestID="cancel-btn"
        onConfirm={onConfirm}
        onClose={onClose}
      />
    );

    expect(getByTestId("confirm-sheet")).toBeTruthy();
    expect(getByText("Konfirmasi")).toBeTruthy();
    expect(getByText("Apakah Anda yakin?")).toBeTruthy();

    await fireEvent.press(getByTestId("cancel-btn"));
    expect(onClose).toHaveBeenCalledTimes(1);

    await fireEvent.press(getByTestId("confirm-btn"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
