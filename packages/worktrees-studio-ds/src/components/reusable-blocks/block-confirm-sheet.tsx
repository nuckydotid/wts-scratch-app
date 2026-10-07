import { UiView, UiText, UiButton, UiSpinner } from "../heroui-primitive";
import { SPINNER_ON_ACCENT } from "../../lib/brand-colors";

type Props = {
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  isConfirming?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  testID?: string;
  confirmTestID?: string;
  cancelTestID?: string;
};

export function BlockConfirmSheet({
  title,
  description,
  confirmLabel,
  variant = "primary",
  isConfirming,
  onConfirm,
  onClose,
  cancelLabel,
  testID,
  confirmTestID,
  cancelTestID,
}: Props) {
  return (
    <UiView testID={testID} className="gap-4">
      <UiText className="text-xl font-semibold text-foreground">{title}</UiText>
      {description && <UiText className="text-base text-muted leading-6">{description}</UiText>}
      <UiView className="flex-row gap-2">
        <UiButton
          testID={cancelTestID}
          variant="ghost"
          className="flex-1"
          isDisabled={isConfirming}
          onPress={onClose}
        >
          {cancelLabel}
        </UiButton>
        <UiButton
          testID={confirmTestID}
          variant={variant}
          className="flex-1"
          isDisabled={isConfirming}
          onPress={() => {
            onConfirm();
            onClose();
          }}
        >
          <UiButton.Label>{confirmLabel}</UiButton.Label>
          {isConfirming && <UiSpinner size="sm" color={SPINNER_ON_ACCENT} />}
        </UiButton>
      </UiView>
    </UiView>
  );
}
