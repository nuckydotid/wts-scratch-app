import { render } from "@testing-library/react-native";
import { FullSheetContext } from "../../teleport";
import { BlockStepsBar, type BlockStepsBarStep } from "../block-steps-bar";

const STEPS: BlockStepsBarStep[] = [
  { testID: "form-step-0" },
  { testID: "form-step-1" },
  { testID: "form-step-2" },
];

function Harness({ activeStep }: { activeStep: number }) {
  return (
    <FullSheetContext.Provider
      value={{ data: { activeStep }, setData: jest.fn(), close: jest.fn() }}
    >
      <BlockStepsBar steps={STEPS} />
    </FullSheetContext.Provider>
  );
}

describe("BlockStepsBar", () => {
  it("renders every step segment with its testID", async () => {
    const { getByTestId } = await render(<Harness activeStep={0} />);
    expect(getByTestId("form-step-0")).toBeTruthy();
    expect(getByTestId("form-step-1")).toBeTruthy();
    expect(getByTestId("form-step-2")).toBeTruthy();
  });

  it("renders without labels or numbers (defaults to the first step)", async () => {
    const { queryByText } = await render(
      <FullSheetContext.Provider value={{ data: undefined, setData: jest.fn(), close: jest.fn() }}>
        <BlockStepsBar steps={STEPS} />
      </FullSheetContext.Provider>
    );
    expect(queryByText("1")).toBeNull();
    expect(queryByText("Judul & Isi")).toBeNull();
  });

  it("renders completed/active segments for any step (active = 2)", async () => {
    const { getByTestId } = await render(<Harness activeStep={2} />);
    expect(getByTestId("form-step-0")).toBeTruthy();
    expect(getByTestId("form-step-2")).toBeTruthy();
  });
});
