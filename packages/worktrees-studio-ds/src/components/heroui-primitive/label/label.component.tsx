import { Label } from "heroui-native/label";
import type { ComponentProps } from "react";

export type UiLabelProps = ComponentProps<typeof Label>;

export function UiLabel({ className, ...props }: UiLabelProps) {
  return <Label className={`p-1 font-normal ${className ?? ""}`.trim()} {...props} />;
}
