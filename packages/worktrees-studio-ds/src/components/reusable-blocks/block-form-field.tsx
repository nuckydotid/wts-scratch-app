import { Keyboard } from "react-native";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { format, parseISO, isValid } from "date-fns";
import {
  UiTextField,
  UiLabel,
  UiInput,
  UiTextArea,
  FieldError,
  UiPressable,
} from "../heroui-primitive";
import { useDatePickerSheet } from "../teleport";

export type FormFieldDef<T extends FieldValues> = {
  /** Date-field only: label for the picker confirm action (host-localized). */
  datePickerConfirmLabel?: string;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: "text" | "date" | "number" | "textarea";
  autoCapitalize?: "none" | "sentences" | "words";
  autoFocus?: boolean;
  /** Sanitizes every keystroke/paste before it reaches the form value
   * (e.g. score fields: digits-only, strip leading zeros, clamp max). */
  transformInput?: (raw: string) => string;
  /** E2E hook — the Maestro flows tap form fields by testID, never placeholder text. */
  testID?: string;
};

type Props<T extends FieldValues> = {
  control: Control<T>;
  field: FormFieldDef<T>;
  isDisabled?: boolean;
};

export function BlockFormField<T extends FieldValues>({ control, field, isDisabled }: Props<T>) {
  const datePicker = useDatePickerSheet();

  return (
    <Controller
      control={control}
      name={field.name}
      render={({ field: rhf, fieldState }) => {
        const error = fieldState.error?.message;

        if (field.type === "textarea") {
          return (
            <UiTextField isInvalid={!!error}>
              <UiLabel onPress={() => Keyboard.dismiss()}>{field.label}</UiLabel>
              <UiTextArea
                value={rhf.value as string}
                onChangeText={rhf.onChange}
                placeholder={field.placeholder}
                editable={!isDisabled}
                testID={field.testID}
              />
              {error && (
                <FieldError testID={field.testID ? `${field.testID}-error` : undefined}>
                  {error}
                </FieldError>
              )}
            </UiTextField>
          );
        }

        if (field.type === "date") {
          const raw = rhf.value as string | undefined;
          const parsed = raw ? parseISO(raw) : undefined;
          const display = raw && parsed && isValid(parsed) ? format(parsed, "dd MMMM yyyy") : "";
          return (
            <UiTextField isInvalid={!!error}>
              <UiLabel onPress={() => Keyboard.dismiss()}>{field.label}</UiLabel>
              <UiPressable
                accessibilityRole="button"
                disabled={isDisabled}
                testID={field.testID}
                onPress={() =>
                  datePicker.open({
                    title: field.label,
                    confirmLabel: field.datePickerConfirmLabel ?? field.label,
                    confirmTestID: "date-picker-confirm",
                    value: raw && isValid(parseISO(raw)) ? parseISO(raw) : new Date(2015, 0, 1),
                    onConfirm: (date) => rhf.onChange(format(date, "yyyy-MM-dd")),
                  })
                }
              >
                <UiInput
                  value={display}
                  placeholder={field.placeholder}
                  editable={false}
                  pointerEvents="none"
                />
              </UiPressable>
              {error && (
                <FieldError testID={field.testID ? `${field.testID}-error` : undefined}>
                  {error}
                </FieldError>
              )}
            </UiTextField>
          );
        }

        return (
          <UiTextField isInvalid={!!error}>
            <UiLabel onPress={() => Keyboard.dismiss()}>{field.label}</UiLabel>
            <UiInput
              value={rhf.value as string}
              onChangeText={(raw) =>
                rhf.onChange(field.transformInput ? field.transformInput(raw) : raw)
              }
              placeholder={field.placeholder}
              autoCapitalize={field.autoCapitalize}
              autoCorrect={false}
              keyboardType={field.type === "number" ? "numeric" : "default"}
              autoFocus={field.autoFocus}
              editable={!isDisabled}
              testID={field.testID}
            />
            {error && (
              <FieldError testID={field.testID ? `${field.testID}-error` : undefined}>
                {error}
              </FieldError>
            )}
          </UiTextField>
        );
      }}
    />
  );
}
