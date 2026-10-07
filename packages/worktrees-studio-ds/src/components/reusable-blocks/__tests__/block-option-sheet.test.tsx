import { fireEvent, render } from "@testing-library/react-native";
import { BlockOptionSheet } from "../block-option-sheet";

const OPTIONS = [
  { label: "Indonesia", value: "id" },
  { label: "English", value: "en" },
];

describe("BlockOptionSheet", () => {
  it("renders the title and every option label", async () => {
    const { getByText } = await render(
      <BlockOptionSheet title="Language" options={OPTIONS} onSelect={() => {}} onClose={() => {}} />
    );
    expect(getByText("Language")).toBeTruthy();
    expect(getByText("Indonesia")).toBeTruthy();
    expect(getByText("English")).toBeTruthy();
  });

  it("marks the selected option as checked", async () => {
    const { getByTestId } = await render(
      <BlockOptionSheet
        title="Language"
        options={OPTIONS}
        selectedValue="en"
        onSelect={() => {}}
        onClose={() => {}}
      />
    );
    const checked = getByTestId("option-en").props.accessibilityState?.checked;
    const unchecked = getByTestId("option-id").props.accessibilityState?.checked;
    expect(checked).toBe(true);
    expect(unchecked).toBe(false);
  });

  it("applies the option and closes the sheet on select", async () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    const { getByTestId } = await render(
      <BlockOptionSheet
        title="Language"
        options={OPTIONS}
        selectedValue="id"
        onSelect={onSelect}
        onClose={onClose}
      />
    );
    await fireEvent.press(getByTestId("option-en"));
    expect(onSelect).toHaveBeenCalledWith("en");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("supports custom testID on options", async () => {
    const customOptions = [
      { label: "Rose", value: "#e11d48", testID: "option-rose" },
      { label: "Blue", value: "#2563eb", testID: "option-blue" },
    ];
    const { getByTestId } = await render(
      <BlockOptionSheet
        title="Color"
        options={customOptions}
        selectedValue="#e11d48"
        onSelect={() => {}}
        onClose={() => {}}
      />
    );
    expect(getByTestId("option-rose")).toBeTruthy();
    expect(getByTestId("option-blue")).toBeTruthy();
  });
});
