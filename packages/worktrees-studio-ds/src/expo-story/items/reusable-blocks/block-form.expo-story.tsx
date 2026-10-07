import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BlockForm, BlockFormSubmit, type FormFieldDef } from "../../../components/reusable-blocks";
import { UiView, UiText, UiButton } from "../../../components";
import { TeleportProvider, useTeleport } from "../../../components/teleport";
import type { ComponentDef } from "./index";

const schema = z.object({
  name: z.string().min(1, "Name is required."),
  age: z.number().min(1, "Age is required."),
  birthDate: z.string().min(1, "Birth date is required."),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const FIELDS: FormFieldDef<FormValues>[] = [
  { name: "name", label: "Name", placeholder: "e.g. Class A", autoCapitalize: "words" },
  { name: "age", label: "Age", type: "number" },
  { name: "birthDate", label: "Birth Date", placeholder: "Select birth date", type: "date" },
  { name: "notes", label: "Notes", type: "textarea" },
];

function FormDemo() {
  const { showFullSheet } = useTeleport();
  const [submitted, setSubmitted] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { name: "", age: undefined, birthDate: "", notes: "" },
  });

  const openSheet = useCallback(() => {
    form.reset({ name: "", age: undefined, birthDate: "", notes: "" });
    const sheet = showFullSheet(
      <BlockForm control={form.control} fields={FIELDS} />,
      <BlockFormSubmit
        form={form}
        submitLabel="Save"
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
      <UiText className="text-lg font-bold text-foreground">BlockForm</UiText>
      <UiText className="text-sm text-muted text-center">
        {submitted ? `Submitted: ${submitted}` : "Nothing submitted yet"}
      </UiText>
      <UiButton variant="primary" size="md" onPress={openSheet}>
        Open Form
      </UiButton>
    </UiView>
  );
}

export const BlockFormBlock: ComponentDef = {
  label: "BlockForm",
  category: "reusable blocks",
  controls: {},
  render: () => (
    <TeleportProvider>
      <FormDemo />
    </TeleportProvider>
  ),
};
