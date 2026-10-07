import { render } from "@testing-library/react-native";
import { BlockLineChart } from "../block-line-chart";

describe("BlockLineChart", () => {
  it("renders the title, legend labels and chart series", async () => {
    const { getByText } = await render(
      <BlockLineChart
        title="Growth"
        series={[
          { id: "weight", label: "Weight", color: "#0ea5e9", data: [{ x: 1, y: 20 }] },
          { id: "height", label: "Height", color: "#22c55e", data: [{ x: 1, y: 100 }] },
        ]}
      />
    );

    expect(getByText("Growth")).toBeTruthy();
    expect(getByText("Weight")).toBeTruthy();
    expect(getByText("Height")).toBeTruthy();
  });

  it("renders without a title", async () => {
    const { queryByText } = await render(
      <BlockLineChart
        series={[{ id: "w", label: "Weight", color: "#0ea5e9", data: [{ x: 1, y: 20 }] }]}
      />
    );
    expect(queryByText("Weight")).toBeTruthy();
  });
});
