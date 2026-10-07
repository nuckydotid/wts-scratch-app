import { render } from "@testing-library/react-native";
import { BlockEmptyState } from "../block-empty-state";

describe("BlockEmptyState", () => {
  it("renders title text correctly", async () => {
    const { getByText } = await render(<BlockEmptyState title="No items available" />);
    expect(getByText("No items available")).toBeTruthy();
  });

  it("renders subtitle when provided", async () => {
    const { getByText } = await render(
      <BlockEmptyState title="No items" subtitle="Create your first item to begin" />
    );
    expect(getByText("No items")).toBeTruthy();
    expect(getByText("Create your first item to begin")).toBeTruthy();
  });

  it("applies testID and custom className", async () => {
    const { getByTestId } = await render(
      <BlockEmptyState testID="custom-empty-state" title="Empty" className="mt-4" />
    );
    const element = getByTestId("custom-empty-state");
    expect(element).toBeTruthy();
    expect(element.props.className).toContain("bg-surface rounded-2xl overflow-hidden");
    expect(element.props.className).toContain("mt-4");
  });
});
