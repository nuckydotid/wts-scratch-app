import { render } from "@testing-library/react-native";
import { BlockProgressSheet } from "../block-progress-sheet";

describe("BlockProgressSheet", () => {
  it("renders with progress percentage and progress bar", async () => {
    const { getByText, getByTestId, queryByTestId } = await render(
      <BlockProgressSheet
        title="Menyiapkan Video..."
        description="Mengunduh media sebelum dibagikan"
        progress={45}
        testID="custom-progress"
      />
    );

    expect(getByText("Menyiapkan Video...")).toBeTruthy();
    expect(getByText("Mengunduh media sebelum dibagikan")).toBeTruthy();
    expect(getByText("45%")).toBeTruthy();
    expect(getByTestId("custom-progress-bar")).toBeTruthy();
    expect(queryByTestId("custom-progress-spinner")).toBeNull();
  });

  it("clamps progress between 0 and 100", async () => {
    const { getByText: getOver } = await render(
      <BlockProgressSheet title="Progress Over" progress={150} testID="p-over" />
    );
    expect(getOver("100%")).toBeTruthy();

    const { getByText: getUnder } = await render(
      <BlockProgressSheet title="Progress Under" progress={-20} testID="p-under" />
    );
    expect(getUnder("0%")).toBeTruthy();
  });

  it("renders indeterminate spinner when progress is undefined", async () => {
    const { getByText, getByTestId, queryByTestId } = await render(
      <BlockProgressSheet title="Menyiapkan..." testID="custom-progress" />
    );

    expect(getByText("Menyiapkan...")).toBeTruthy();
    expect(getByTestId("custom-progress-spinner")).toBeTruthy();
    expect(queryByTestId("custom-progress-bar")).toBeNull();
  });
});
