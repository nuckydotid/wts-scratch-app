import { Spinner } from "heroui-native/spinner";
import type { ComponentProps } from "react";

export type UiSpinnerProps = ComponentProps<typeof Spinner>;

export function UiSpinner(props: UiSpinnerProps) {
  return <Spinner {...props} />;
}
