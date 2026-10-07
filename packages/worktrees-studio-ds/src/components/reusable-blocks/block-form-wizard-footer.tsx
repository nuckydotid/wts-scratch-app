import type { FieldErrors, FieldValues, Path, UseFormReturn } from "react-hook-form";
import { SPINNER_ON_ACCENT } from "../../lib/brand-colors";
import { useFormState } from "react-hook-form";
import { UiButton, UiSpinner, UiView } from "../heroui-primitive";
import { useFullSheet, useTeleport } from "../teleport";

const MAX_VALIDATION_TOASTS = 3;

type Props<T extends FieldValues> = {
  form: UseFormReturn<T>;
  /** Field names validated on Next per step (index-aligned with the steps
   *  bar; the LAST step is the submit step, not a Next). Empty arrays skip
   *  validation (optional steps). */
  stepFields: string[][];
  nextLabel: string;
  backLabel: string;
  /** First-step only: a Cancel (closes the sheet) beside Next. */
  cancelLabel: string;
  submitLabel: string;
  onSubmit: (values: T) => void;
  /** E2E hooks — Maestro taps by testID. */
  submitTestID?: string;
  nextTestID?: string;
  backTestID?: string;
  cancelTestID?: string;
  /** Toast contract (title + subtitle): when provided, validation failures
   * toast `{ title: validationToastTitle, description: firstError }` instead
   * of bare message-as-title (both on Next and on the final submit). */
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
 * Sticky wizard footer for multi-step fullsheet forms. Step state lives in the
 * fullsheet's data store (`useFullSheet`): the content renders the active
 * step, this footer navigates it.
 *
 * - Step 0 (first): full-width **Next** — validates the step's `stepFields`
 *   via `form.trigger`; invalid → per-field errors + toasts, no advance.
 * - Middle steps: **Back** (outline) beside **Next**.
 * - Last step: **Back** beside the real submit — `handleSubmit` with the
 *   same contract as BlockFormSubmit (never disabled for incomplete forms,
 *   specific error toasts capped at 3, spinner while `isSubmitting`).
 */
export function BlockFormWizardFooter<T extends FieldValues>({
  form,
  stepFields,
  nextLabel,
  backLabel,
  cancelLabel,
  submitLabel,
  onSubmit,
  submitTestID,
  nextTestID,
  backTestID,
  cancelTestID,
  validationToastTitle,
}: Props<T>) {
  const { showToast } = useTeleport();
  const { data, setData, close } = useFullSheet<{ activeStep?: number }>();
  const { isSubmitting } = useFormState({ control: form.control });

  const activeStep = data?.activeStep ?? 0;
  const isLast = activeStep >= stepFields.length - 1;
  const showBack = activeStep > 0;

  const onInvalid = (errors: FieldErrors<T>) => {
    const messages = fieldErrorMessages(errors).slice(0, MAX_VALIDATION_TOASTS);
    if (validationToastTitle) {
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

  const handleNext = async () => {
    const fields = stepFields[activeStep] ?? [];
    const valid = await form.trigger(fields as Path<T>[]);
    if (!valid) {
      // `form.formState` can lag the awaited trigger — read the per-field
      // errors straight from the field store.
      if (validationToastTitle) {
        for (const name of fields) {
          const message = form.getFieldState(name as Path<T>).error?.message;
          if (message)
            showToast({ variant: "danger", title: validationToastTitle, description: message });
        }
        return;
      }
      for (const name of fields) {
        const message = form.getFieldState(name as Path<T>).error?.message;
        if (message) showToast({ variant: "danger", title: message });
      }
      return;
    }
    setData({ activeStep: activeStep + 1 });
  };

  const handleBack = () => {
    if (activeStep > 0) setData({ activeStep: activeStep - 1 });
  };

  const primaryLabel = isLast ? submitLabel : nextLabel;
  const primaryTestID = isLast ? submitTestID : nextTestID;
  const onPrimary = isLast ? form.handleSubmit(onSubmit, onInvalid) : handleNext;

  if (showBack) {
    return (
      <UiView className="flex-row gap-3">
        <UiButton
          variant="outline"
          className="flex-1"
          isDisabled={isSubmitting}
          onPress={handleBack}
          testID={backTestID}
        >
          <UiButton.Label>{backLabel}</UiButton.Label>
        </UiButton>
        <UiButton
          variant="primary"
          className="flex-1"
          isDisabled={isSubmitting}
          onPress={onPrimary}
          testID={primaryTestID}
        >
          <UiButton.Label>{primaryLabel}</UiButton.Label>
          {isSubmitting && (
            <UiSpinner size="sm" color={SPINNER_ON_ACCENT} testID="submit-spinner" />
          )}
        </UiButton>
      </UiView>
    );
  }

  // First step: Cancel (closes the sheet) beside Next.
  return (
    <UiView className="flex-row gap-3">
      <UiButton
        variant="outline"
        className="flex-1"
        isDisabled={isSubmitting}
        onPress={close}
        testID={cancelTestID}
      >
        <UiButton.Label>{cancelLabel}</UiButton.Label>
      </UiButton>
      <UiButton
        variant="primary"
        className="flex-1"
        isDisabled={isSubmitting}
        onPress={onPrimary}
        testID={primaryTestID}
      >
        <UiButton.Label>{primaryLabel}</UiButton.Label>
        {isSubmitting && <UiSpinner size="sm" color={SPINNER_ON_ACCENT} testID="submit-spinner" />}
      </UiButton>
    </UiView>
  );
}
