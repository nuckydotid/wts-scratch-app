import { render, fireEvent } from "@testing-library/react-native";
import { FullSheetContext } from "../../teleport";
import { BlockSheetActionFooter } from "../block-sheet-action-footer";

describe("BlockSheetActionFooter", () => {
  it("runs the action published by the sheet content", async () => {
    const onAction = jest.fn();
    const { getByTestId, queryByTestId } = await render(
      <FullSheetContext.Provider
        value={{ data: { isBusy: false, onAction }, setData: jest.fn(), close: jest.fn() }}
      >
        <BlockSheetActionFooter label="Simpan" testID="sheet-save" />
      </FullSheetContext.Provider>
    );

    await fireEvent.press(getByTestId("sheet-save"));
    expect(onAction).toHaveBeenCalled();
    expect(queryByTestId("submit-spinner")).toBeNull();
  });

  it("shows the busy spinner while saving", async () => {
    const { getByTestId } = await render(
      <FullSheetContext.Provider
        value={{
          data: { isBusy: true, onAction: jest.fn() },
          setData: jest.fn(),
          close: jest.fn(),
        }}
      >
        <BlockSheetActionFooter label="Simpan" testID="sheet-save" />
      </FullSheetContext.Provider>
    );

    expect(getByTestId("submit-spinner")).toBeTruthy();
  });
});
