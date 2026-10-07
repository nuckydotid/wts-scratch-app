import type { ReactNode } from "react";
import { Keyboard } from "react-native";
import { UiPressable } from "../heroui-primitive";

type Props = {
  children: ReactNode;
};

/**
 * Transparent tap area that dismisses the keyboard. Wraps static sheet text
 * (form title/subtitle, field labels) so a tap outside an input closes the
 * keyboard. `accessible={false}` keeps it out of the a11y tree — the wrapped
 * text remains readable.
 */
export function BlockDismissKeysArea({ children }: Props) {
  return (
    <UiPressable accessible={false} onPress={() => Keyboard.dismiss()}>
      {children}
    </UiPressable>
  );
}
