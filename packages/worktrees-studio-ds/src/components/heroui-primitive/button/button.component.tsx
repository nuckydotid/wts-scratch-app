import { Button, type ButtonLabelProps } from "heroui-native/button";
import type { ComponentProps, Ref } from "react";
import type { Text } from "react-native";

export type UiButtonProps = ComponentProps<typeof Button>;

/**
 * Single-line label with ellipsis truncation.
 * In React 19, ref is accepted directly as a component prop without forwardRef.
 */
function UiButtonLabel({ ref, style, ...props }: ButtonLabelProps & { ref?: Ref<Text> }) {
  return (
    <Button.Label
      ref={ref as React.RefObject<Text>}
      numberOfLines={1}
      style={[{ flexShrink: 1 }, style]}
      {...props}
    />
  );
}
UiButtonLabel.displayName = "UiButtonLabel";

export const UiButton = Object.assign(
  function UiButton(props: UiButtonProps) {
    return <Button {...props} />;
  },
  Button,
  { Label: UiButtonLabel }
);
UiButton.displayName = "UiButton";
