import {
  FieldError,
  UiButton,
  UiCard,
  UiInput,
  UiLabel,
  UiPressable,
  UiText,
  UiTextField,
  UiSpinner,
  UiView,
} from "../heroui-primitive";
import { SPINNER_ON_ACCENT } from "../../lib/brand-colors";

type Props = {
  otp: string;
  otpError: string;
  isLoading: boolean;
  buttonLabel: string;
  onChangeOtp?: (value: string) => void;
  onPressVerify?: () => void;
  onOtpComplete?: (value: string) => void;
  otpLabel: string;
  otpInputTestID?: string;
  verifyButtonTestID?: string;
  autoFocus?: boolean;
};

export function BlockOtpForm({
  otp,
  otpError,
  isLoading,
  buttonLabel,
  onChangeOtp,
  onPressVerify,
  onOtpComplete,
  otpLabel,
  otpInputTestID,
  verifyButtonTestID,
  autoFocus,
}: Props) {
  const handleChange = (value: string) => {
    onChangeOtp?.(value);
    if (value.length === 6) onOtpComplete?.(value);
  };

  return (
    <UiView className="mt-4">
      <UiCard variant="default" className="p-4 gap-4">
        <UiTextField isInvalid={!!otpError}>
          <UiLabel>{otpLabel}</UiLabel>
          <UiInput
            value={otp}
            onChangeText={handleChange}
            maxLength={6}
            keyboardType="number-pad"
            className="w-48 text-lg tracking-[8px] font-mono"
            isDisabled={isLoading}
            testID={otpInputTestID}
            autoFocus={autoFocus}
          />
          {!!otpError && (
            <FieldError testID={otpInputTestID ? `${otpInputTestID}-error` : undefined}>
              {otpError}
            </FieldError>
          )}
        </UiTextField>

        <UiButton
          variant="primary"
          className="w-full"
          isDisabled={isLoading}
          onPress={onPressVerify}
          testID={verifyButtonTestID}
        >
          <UiButton.Label>{buttonLabel}</UiButton.Label>
          {isLoading && <UiSpinner size="sm" color={SPINNER_ON_ACCENT} />}
        </UiButton>
      </UiCard>
    </UiView>
  );
}
