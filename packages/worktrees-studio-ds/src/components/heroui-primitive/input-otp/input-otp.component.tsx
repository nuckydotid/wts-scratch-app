import { InputOTP } from "heroui-native/input-otp";
import type { ComponentProps } from "react";
import { useCSSVariable } from "uniwind";

export type UiInputOTPProps = ComponentProps<typeof InputOTP>;
export type UiInputOTPGroupProps = ComponentProps<typeof InputOTP.Group>;
export type UiInputOTPSlotProps = ComponentProps<typeof InputOTP.Slot>;
export type UiInputOTPSeparatorProps = ComponentProps<typeof InputOTP.Separator>;

function InputOTPRoot(props: UiInputOTPProps) {
  const accentColor = useCSSVariable("--color-accent") as string;
  const placeholderColor = useCSSVariable("--color-field-placeholder") as string;

  return (
    <InputOTP
      {...props}
      placeholderTextColor={placeholderColor}
      textInputProps={{
        selectionColor: accentColor,
        cursorColor: accentColor,
        ...(props.textInputProps ?? {}),
      }}
    />
  );
}

InputOTPRoot.displayName = "UiInputOTP";
export const UiInputOTP = Object.assign(InputOTPRoot, {
  Group: InputOTP.Group,
  Slot: InputOTP.Slot,
  Separator: InputOTP.Separator,
});
UiInputOTP.displayName = "UiInputOTP";
