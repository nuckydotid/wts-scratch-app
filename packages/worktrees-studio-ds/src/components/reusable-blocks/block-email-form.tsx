import {
  FieldError,
  UiButton,
  UiCard,
  UiInput,
  UiLabel,
  UiSpinner,
  UiTextField,
} from "../heroui-primitive";
import { SPINNER_ON_ACCENT } from "../../lib/brand-colors";

type Props = {
  email: string;
  emailError: string;
  isLoading: boolean;
  buttonLabel: string;
  onChangeEmail?: (value: string) => void;
  onPressSendCode?: () => void;
  emailLabel: string;
  emailPlaceholder?: string;
  emailInputTestID?: string;
  sendButtonTestID?: string;
};

export function BlockEmailForm({
  email,
  emailError,
  isLoading,
  buttonLabel,
  onChangeEmail,
  onPressSendCode,
  emailLabel,
  emailPlaceholder,

  emailInputTestID,
  sendButtonTestID,
}: Props) {
  return (
    <UiCard variant="default" className="p-4 gap-4">
      <UiTextField isInvalid={!!emailError}>
        <UiLabel>{emailLabel}</UiLabel>
        <UiInput
          value={email}
          onChangeText={onChangeEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          className="w-full"
          isDisabled={isLoading}
          placeholder={emailPlaceholder}
          testID={emailInputTestID}
        />
        {!!emailError && (
          <FieldError testID={emailInputTestID ? `${emailInputTestID}-error` : undefined}>
            {emailError}
          </FieldError>
        )}
      </UiTextField>
      <UiButton
        variant="primary"
        className="w-full"
        isDisabled={isLoading}
        onPress={onPressSendCode}
        testID={sendButtonTestID}
      >
        <UiButton.Label>{buttonLabel}</UiButton.Label>
        {isLoading && <UiSpinner size="sm" color={SPINNER_ON_ACCENT} />}
      </UiButton>
    </UiCard>
  );
}
