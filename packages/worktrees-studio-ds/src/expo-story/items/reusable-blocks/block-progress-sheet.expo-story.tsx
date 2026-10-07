import { UiView } from "../../../components";
import { BlockProgressSheet } from "../../../components/reusable-blocks/block-progress-sheet";
import type { ComponentDef } from "./index";

export const BlockProgressSheetBlock: ComponentDef = {
  label: "BlockProgressSheet",
  category: "reusable-blocks",
  controls: {
    progress: {
      type: "select",
      options: ["10", "30", "50", "75", "100"],
      default: "50",
    },
    indeterminate: { type: "boolean", default: false },
  },
  render: (p) => (
    <UiView className="flex-1 items-center justify-center p-6 bg-surface">
      <UiView className="w-full max-w-sm p-4 rounded-2xl bg-card border border-border">
        <BlockProgressSheet
          title="Menyiapkan Video..."
          description="Mengunduh media sebelum dibagikan"
          progress={p.indeterminate ? undefined : Number(p.progress ?? "50")}
        />
      </UiView>
    </UiView>
  ),
};
