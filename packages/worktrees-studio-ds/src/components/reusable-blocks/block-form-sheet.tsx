import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { UiView } from "../heroui-primitive";
import { BlockFormField } from "./block-form-field";

type Props<T extends FieldValues> = {
  form: UseFormReturn<T>;
  title: string;
  subtitle?: string;
  label?: string;
  placeholder?: string;
  fieldName?: Path<T>;
  /** E2E hook — testID of the name input. */
  fieldTestID?: string;
};

export function BlockFormSheet<T extends FieldValues>({
  form,
  title,
  subtitle,
  label,
  placeholder,
  fieldName,
  fieldTestID,
}: Props<T>) {
  return (
    <UiView className="gap-4">
      <BlockFormField
        control={form.control}
        field={{
          name: (fieldName ?? "name") as Path<T>,
          label: label ?? title,
          placeholder,
          type: "text",
          testID: fieldTestID,
        }}
      />
    </UiView>
  );
}
