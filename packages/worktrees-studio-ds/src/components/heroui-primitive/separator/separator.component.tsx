import { Separator } from "heroui-native/separator";
import type { ComponentProps } from "react";
import { Platform } from "react-native";

export type UiSeparatorProps = ComponentProps<typeof Separator>;

export function UiSeparator({ style, variant, orientation, ...props }: UiSeparatorProps) {
  const isWeb = Platform.OS === "web";
  const needsHeightFix = isWeb && variant !== "thick" && orientation !== "vertical";
  return (
    <Separator
      variant={variant}
      orientation={orientation}
      style={[needsHeightFix && { height: 1 }, style].filter(Boolean)}
      {...props}
    />
  );
}
