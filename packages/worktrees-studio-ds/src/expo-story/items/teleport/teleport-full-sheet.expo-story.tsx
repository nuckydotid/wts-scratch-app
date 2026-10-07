import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BlockFormSheet, BlockFormSubmit } from "../../../components/reusable-blocks";
import { UiView, UiText, UiButton } from "../../../components";
import { TeleportProvider, useTeleport } from "../../../components/teleport";
import type { ComponentDef } from "./index";

const schema = z.object({ name: z.string().min(1) });
type FormValues = z.infer<typeof schema>;

function FullSheetDemo() {
  const { showFullSheet } = useTeleport();
  const [submitted, setSubmitted] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { name: "" },
  });

  const openSheet = useCallback(() => {
    form.reset({ name: "" });
    const sheet = showFullSheet(
      <BlockFormSheet
        form={form}
        title="New Semester"
        label="Name (e.g. 2025 Odd)"
        placeholder="Enter semester name"
      />,
      <BlockFormSubmit
        form={form}
        submitLabel="Create"
        onSubmit={({ name }) => {
          setSubmitted(name);
          sheet.close();
        }}
      />,
      { title: "Sheet", subtitle: "Detail" }
    );
  }, [form, showFullSheet]);

  return (
    <UiView className="flex-1 items-center justify-center p-6 gap-4">
      <UiText className="text-lg font-bold text-foreground">TeleportFullSheet</UiText>
      <UiText className="text-sm text-muted text-center">
        {submitted ? `Submitted: ${submitted}` : "Nothing submitted yet"}
      </UiText>
      <UiButton variant="primary" size="md" onPress={openSheet}>
        Open Full Sheet
      </UiButton>
    </UiView>
  );
}

export const TeleportFullSheet: ComponentDef = {
  label: "TeleportFullSheet",
  category: "teleport",
  controls: {},
  render: () => (
    <TeleportProvider>
      <FullSheetDemo />
    </TeleportProvider>
  ),
};
