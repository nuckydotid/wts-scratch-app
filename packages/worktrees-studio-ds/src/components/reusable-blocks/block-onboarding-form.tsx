import {
  FieldError,
  UiButton,
  UiCard,
  UiCheckbox,
  UiInput,
  UiLabel,
  UiSpinner,
  UiText,
  UiTextField,
  UiView,
} from "../heroui-primitive";
import { SPINNER_ON_ACCENT } from "../../lib/brand-colors";

export type BlockOnboardingFormProps = {
  name: string;
  nameError?: string;
  nameLabel: string;
  namePlaceholder?: string;
  phone: string;
  phoneError?: string;
  phoneLabel: string;
  phonePlaceholder?: string;
  acceptedTerms?: boolean;
  termsError?: string;
  termsPrefix?: string;
  termsLinkLabel?: string;
  termsAndLabel?: string;
  privacyLinkLabel?: string;
  onPressTerms?: () => void;
  onPressPrivacy?: () => void;
  onChangeAcceptedTerms?: (value: boolean) => void;
  buttonLabel: string;
  isLoading?: boolean;
  onChangeName?: (value: string) => void;
  onChangePhone?: (value: string) => void;
  onSubmit?: () => void;
  nameInputTestID?: string;
  phoneInputTestID?: string;
  termsCheckboxTestID?: string;
  submitButtonTestID?: string;
};

export function BlockOnboardingForm({
  name,
  nameError,
  nameLabel,
  namePlaceholder,
  phone,
  phoneError,
  phoneLabel,
  phonePlaceholder,
  acceptedTerms = false,
  termsError,
  termsPrefix,
  termsLinkLabel,
  termsAndLabel,
  privacyLinkLabel,
  onPressTerms,
  onPressPrivacy,
  onChangeAcceptedTerms,
  buttonLabel,
  isLoading = false,
  onChangeName,
  onChangePhone,
  onSubmit,
  nameInputTestID = "onboarding-name-input",
  phoneInputTestID = "onboarding-phone-input",
  termsCheckboxTestID = "onboarding-terms-checkbox",
  submitButtonTestID = "onboarding-submit",
}: BlockOnboardingFormProps) {
  return (
    <UiCard variant="default" className="p-4 gap-4">
      <UiTextField isInvalid={!!nameError}>
        <UiLabel>{nameLabel}</UiLabel>
        <UiInput
          value={name}
          onChangeText={onChangeName}
          autoCapitalize="words"
          className="w-full"
          isDisabled={isLoading}
          placeholder={namePlaceholder}
          testID={nameInputTestID}
        />
        {!!nameError && (
          <FieldError
            isInvalid={!!nameError}
            testID={nameInputTestID ? `${nameInputTestID}-error` : undefined}
          >
            {nameError}
          </FieldError>
        )}
      </UiTextField>

      <UiTextField isInvalid={!!phoneError}>
        <UiLabel>{phoneLabel}</UiLabel>
        <UiInput
          value={phone}
          onChangeText={onChangePhone}
          keyboardType="phone-pad"
          className="w-full"
          isDisabled={isLoading}
          placeholder={phonePlaceholder}
          testID={phoneInputTestID}
        />
        {!!phoneError && (
          <FieldError
            isInvalid={!!phoneError}
            testID={phoneInputTestID ? `${phoneInputTestID}-error` : undefined}
          >
            {phoneError}
          </FieldError>
        )}
      </UiTextField>

      {termsPrefix ? (
        <UiView className="gap-1">
          <UiView className="flex-row items-start gap-2">
            <UiCheckbox
              isSelected={acceptedTerms}
              onSelectedChange={onChangeAcceptedTerms}
              isDisabled={isLoading}
              isInvalid={!!termsError}
              testID={termsCheckboxTestID}
            />
            <UiText className="font-primary text-xs text-muted flex-1 leading-5">
              {termsPrefix}{" "}
              <UiText
                className="font-primary text-xs text-primary underline"
                onPress={onPressTerms}
              >
                {termsLinkLabel}
              </UiText>{" "}
              {termsAndLabel}{" "}
              <UiText
                className="font-primary text-xs text-primary underline"
                onPress={onPressPrivacy}
              >
                {privacyLinkLabel}
              </UiText>
              .
            </UiText>
          </UiView>
          {!!termsError && (
            <UiText
              className="font-primary-medium text-xs text-danger"
              testID={termsCheckboxTestID ? `${termsCheckboxTestID}-error` : undefined}
            >
              {termsError}
            </UiText>
          )}
        </UiView>
      ) : null}

      <UiButton
        variant="primary"
        className="w-full"
        isDisabled={isLoading}
        onPress={onSubmit}
        testID={submitButtonTestID}
      >
        <UiButton.Label>{buttonLabel}</UiButton.Label>
        {isLoading && <UiSpinner size="sm" color={SPINNER_ON_ACCENT} />}
      </UiButton>
    </UiCard>
  );
}
