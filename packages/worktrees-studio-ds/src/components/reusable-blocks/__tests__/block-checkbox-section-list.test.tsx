import { fireEvent, render } from "@testing-library/react-native";
import { BlockCheckboxSectionList, type CheckboxSection } from "../block-checkbox-section-list";

const SECTIONS: CheckboxSection[] = [
  {
    id: "teachers",
    title: "Guru",
    items: [{ id: "u-t1", title: "Aprin Afia", testID: "mention-u-t1" }],
  },
  {
    id: "s-1",
    title: "Semester 1 2026/2027",
    items: [
      { id: "u-p1", title: "Siti Nurhaliza", testID: "mention-u-p1" },
      { id: "u-p2", title: "Budi Ayah", testID: "mention-u-p2" },
    ],
  },
];

function Harness({ selectedIds = [] }: { selectedIds?: string[] }) {
  return (
    <BlockCheckboxSectionList
      sections={SECTIONS}
      selectedIds={selectedIds}
      onToggle={jest.fn()}
      onToggleAll={jest.fn()}
      headerTestIDFor={(s) => `group-${s.id}`}
    />
  );
}

describe("BlockCheckboxSectionList label taps", () => {
  it("toggling a member via its label fires onToggle with the member id", async () => {
    const onToggle = jest.fn();
    const { getByText } = await render(
      <BlockCheckboxSectionList
        sections={SECTIONS}
        selectedIds={[]}
        onToggle={onToggle}
        onToggleAll={jest.fn()}
        headerTestIDFor={(s) => `group-${s.id}`}
      />
    );
    await fireEvent.press(getByText("Siti Nurhaliza"));
    expect(onToggle).toHaveBeenCalledWith("u-p1");
  });

  it("toggling a section title fires onToggleAll with the section", async () => {
    const onToggleAll = jest.fn();
    const { getByText } = await render(
      <BlockCheckboxSectionList
        sections={SECTIONS}
        selectedIds={[]}
        onToggle={jest.fn()}
        onToggleAll={onToggleAll}
        headerTestIDFor={(s) => `group-${s.id}`}
      />
    );
    await fireEvent.press(getByText("Guru"));
    expect(onToggleAll).toHaveBeenCalledWith(SECTIONS[0]);
  });

  it("renders the checkbox testIDs as before", async () => {
    const { getByTestId } = await render(<Harness />);
    expect(getByTestId("mention-u-t1")).toBeTruthy();
    expect(getByTestId("group-teachers")).toBeTruthy();
  });

  it("disables all checkboxes and keeps label taps inert when disabled", async () => {
    const onToggle = jest.fn();
    const onToggleAll = jest.fn();
    const { getByTestId, getByText } = await render(
      <BlockCheckboxSectionList
        sections={SECTIONS}
        selectedIds={["u-t1", "u-p1", "u-p2"]}
        onToggle={onToggle}
        onToggleAll={onToggleAll}
        headerTestIDFor={(s) => `group-${s.id}`}
        disabled
      />
    );
    expect(getByTestId("mention-u-p1").props.accessibilityState?.checked).toBe(true);
    expect(getByTestId("group-s-1").props.accessibilityState?.checked).toBe(true);
    await fireEvent.press(getByText("Siti Nurhaliza"));
    await fireEvent.press(getByText("Guru"));
    expect(onToggle).not.toHaveBeenCalled();
    expect(onToggleAll).not.toHaveBeenCalled();
  });
});
