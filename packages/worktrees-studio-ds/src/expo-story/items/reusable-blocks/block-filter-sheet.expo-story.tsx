import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BlockFilterSheet, BlockFormSubmit } from "../../../components/reusable-blocks";
import { UiView, UiText, UiButton } from "../../../components";
import { TeleportProvider, useTeleport } from "../../../components/teleport";
import type { ComponentDef } from "./index";

const OPTIONS = [
  { label: "All", value: undefined },
  { label: "Active", value: "active" },
  { label: "Suspended", value: "suspended" },
];

const schema = z.object({ q: z.string(), status: z.string().optional() });
type FormValues = z.infer<typeof schema>;

function FilterSheetDemo() {
  const { showFullSheet } = useTeleport();
  const [applied, setApplied] = useState<string>("");
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { q: "", status: undefined },
  });

  const openSheet = useCallback(() => {
    form.reset({ q: "", status: undefined });
    const sheet = showFullSheet(
      <BlockFilterSheet
        form={form}
        title="Filter parents"
        searchPlaceholder="Search..."
        statusLabel="Account status"
        options={OPTIONS}
      />,
      <BlockFormSubmit
        form={form}
        submitLabel="Apply"
        onSubmit={({ q, status }) => {
          setApplied(`${q.trim() || "-"} / ${status ?? "-"}`);
          sheet.close();
        }}
      />,
      { title: "Sheet", subtitle: "Detail" }
    );
  }, [form, showFullSheet]);

  return (
    <UiView className="flex-1 items-center justify-center p-6 gap-4">
      <UiText className="text-lg font-bold text-foreground">BlockFilterSheet</UiText>
      <UiText className="text-sm text-muted text-center">
        Applied: {applied || "nothing yet"}
      </UiText>
      <UiButton variant="primary" size="md" onPress={openSheet}>
        Open Filter Sheet
      </UiButton>
    </UiView>
  );
}

export const BlockFilterSheetBlock: ComponentDef = {
  label: "BlockFilterSheet",
  category: "reusable blocks",
  controls: {},
  render: () => (
    <TeleportProvider>
      <FilterSheetDemo />
    </TeleportProvider>
  ),
};
