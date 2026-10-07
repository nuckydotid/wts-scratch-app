import { fireEvent, render } from "@testing-library/react-native";
import { TeleportDatePickerView } from "../teleport-date-picker-view";

describe("TeleportDatePickerView", () => {
  it("renders day/month/year wheels in date mode", async () => {
    const { getByText } = await render(
      <TeleportDatePickerView
        value={new Date(2026, 1, 13)}
        confirmLabel="OK"
        confirmTestID="picker-confirm"
        onConfirm={jest.fn()}
      />
    );
    // Day column uses zero-padded day numbers.
    expect(getByText("13")).toBeTruthy();
    expect(getByText("01")).toBeTruthy();
    // Month wheel uses short English names by default.
    expect(getByText("Feb")).toBeTruthy();
  });

  it("exposes deterministic wheel item testIDs for E2E month selection", async () => {
    const { getByTestId } = await render(
      <TeleportDatePickerView
        value={new Date(2026, 8, 14)}
        mode="month"
        confirmLabel="Terapkan"
        confirmTestID="month-confirm"
        onConfirm={jest.fn()}
      />
    );
    // Every month row + year row is addressable by id (E2E walks the wheel
    // with taps; the attendance journey verifies selection on device).
    for (let month = 0; month < 12; month++) {
      expect(getByTestId(`date-picker-month-${month}`)).toBeTruthy();
    }
    expect(getByTestId("date-picker-year-2026")).toBeTruthy();
    expect(getByTestId("month-confirm")).toBeTruthy();
  });

  it("hides the day wheel in month mode and confirms the 1st of the month", async () => {
    const onConfirm = jest.fn();
    const { getByText, queryByText, getByTestId } = await render(
      <TeleportDatePickerView
        value={new Date(2026, 1, 13)}
        mode="month"
        confirmLabel="Terapkan"
        confirmTestID="month-confirm"
        onConfirm={onConfirm}
      />
    );
    // No day column — day numbers like "13" must not render.
    expect(queryByText("13")).toBeNull();
    // Month wheel falls back to full English month names.
    expect(getByText("February")).toBeTruthy();
    await fireEvent.press(getByTestId("month-confirm"));
    expect(onConfirm).toHaveBeenCalledWith(new Date(2026, 1, 1));
  });

  it("renders host-localized month labels in month mode", async () => {
    const { getByText, queryByText } = await render(
      <TeleportDatePickerView
        value={new Date(2026, 2, 1)}
        mode="month"
        monthLabels={[
          "Januari",
          "Februari",
          "Maret",
          "April",
          "Mei",
          "Juni",
          "Juli",
          "Agustus",
          "September",
          "Oktober",
          "November",
          "Desember",
        ]}
        confirmLabel="Terapkan"
        confirmTestID="month-confirm"
        onConfirm={jest.fn()}
      />
    );
    expect(getByText("Maret")).toBeTruthy();
    expect(queryByText("March")).toBeNull();
  });
});
