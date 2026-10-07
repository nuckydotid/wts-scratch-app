import type { FieldErrors, FieldValues, UseFormReturn } from "react-hook-form";
import { SPINNER_ON_ACCENT } from "../../lib/brand-colors";
import { useFormState } from "react-hook-form";
import { UiButton, UiSpinner } from "../heroui-primitive";
import { useTeleport } from "../teleport";

const MAX_VALIDATION_TOASTS = 3;

type Props<T extends FieldValues> = {
  form: UseFormReturn<T>;
  submitLabel: string;
  onSubmit: (values: T) => void;
  /** E2E hook — Maestro taps the submit by testID. */
  submitTestID?: string;
  /** Toast contract (title + subtitle): when provided, validation failures
   * toast `{ title: validationToastTitle, description: firstError }` instead
   * of bare message-as-title. Host passes a localized string via texts. */
  validationToastTitle?: string;
};

function fieldErrorMessages<T extends FieldValues>(errors: FieldErrors<T>): string[] {
  const messages: string[] = [];
  for (const error of Object.values(errors)) {
    const message = error?.message;
    if (typeof message === "string" && message.length > 0) messages.push(message);
  }
  return messages;
}

/**
 * Sticky form submit. Contract:
 * - **Never disabled for incomplete forms** — the button stays enabled; RHF
 *   validation runs on submit (zod resolver) and surfaces as per-field error
 *   states PLUS specific error toasts. Toast shape follows the two-tier
 *   contract (`AGENTS_CONVENTIONS.md` String Handling): with
 *   `validationToastTitle`, each toast is `{ title, description:
 *   firstFieldMessage }`; without it, legacy single-toast per field message.
 *   Capped at 3 toasts. Only `isSubmitting` disables the button.
 * - Uses `useFormState` so the submit re-renders inside the teleport overlay
 *   (reading `form.formState` from the host would keep it disabled forever —
 *   the original "unreachable submit" bug).
 */
export function BlockFormSubmit<T extends FieldValues>({
  form,
  submitLabel,
  onSubmit,
  submitTestID,
  validationToastTitle,
}: Props<T>) {
  const { showToast } = useTeleport();
  const { isSubmitting } = useFormState({ control: form.control });

  const onInvalid = (errors: FieldErrors<T>) => {
    const messages = fieldErrorMessages(errors).slice(0, MAX_VALIDATION_TOASTS);
    if (validationToastTitle) {
      // Two-tier toast: generic title + first field message as subtitle.
      showToast({
        variant: "danger",
        title: validationToastTitle,
        description: messages[0],
      });
      return;
    }
    for (const message of messages) {
      showToast({ variant: "danger", title: message });
    }
  };

  return (
    <UiButton
      variant="primary"
      className="w-full"
      isDisabled={isSubmitting}
      onPress={form.handleSubmit(onSubmit, onInvalid)}
      testID={submitTestID}
    >
      <UiButton.Label>{submitLabel}</UiButton.Label>
      {isSubmitting && <UiSpinner size="sm" color={SPINNER_ON_ACCENT} testID="submit-spinner" />}
    </UiButton>
  );
}
