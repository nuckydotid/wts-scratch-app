import { Alert as HeroAlert } from "heroui-native/alert";
import type { ComponentProps } from "react";

export type UiAlertProps = ComponentProps<typeof HeroAlert>;

export const UiAlert = Object.assign(function UiAlert(props: UiAlertProps) {
  return <HeroAlert {...props} />;
}, HeroAlert);
UiAlert.displayName = "UiAlert";
