import type { ComponentDef } from "./index";
import { BlockLineChart } from "../../../components/reusable-blocks";
import * as C from "../heroui-primitive/controls";

export const BlockLineChartBlock: ComponentDef = {
  label: "BlockLineChart",
  category: "reusable blocks",
  controls: {
    title: C.txt("Growth"),
    showLegend: C.bool(true),
  },
  render: (p) => (
    <BlockLineChart
      title={p.title as string}
      series={[
        {
          id: "weight",
          label: "Berat (kg)",
          color: "#0ea5e9",
          data: [
            { x: 1, y: 12.1 },
            { x: 2, y: 12.6 },
            { x: 3, y: 13.0 },
            { x: 4, y: 13.4 },
          ],
        },
        {
          id: "height",
          label: "Tinggi (cm)",
          color: "#22c55e",
          data: [
            { x: 1, y: 92 },
            { x: 2, y: 94 },
            { x: 3, y: 96 },
            { x: 4, y: 98 },
          ],
        },
        {
          id: "head",
          label: "Lingkar kepala (cm)",
          color: "#f59e0b",
          data: [
            { x: 1, y: 48 },
            { x: 2, y: 49 },
            { x: 3, y: 49.4 },
            { x: 4, y: 50 },
          ],
        },
      ]}
    />
  ),
};
