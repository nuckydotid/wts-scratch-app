import type { Control, FieldValues } from "react-hook-form";
import { UiView } from "../heroui-primitive";
import { BlockFormField, type FormFieldDef } from "./block-form-field";

type Props<T extends FieldValues> = {
  control: Control<T>;
  fields: FormFieldDef<T>[];
  isDisabled?: boolean;
};

export function BlockForm<T extends FieldValues>({ control, fields, isDisabled }: Props<T>) {
  return (
    <UiView className="gap-4">
      {fields.map((field) => (
        <BlockFormField
          key={field.name as string}
          control={control}
          field={field}
          isDisabled={isDisabled}
        />
      ))}
    </UiView>
  );
}
