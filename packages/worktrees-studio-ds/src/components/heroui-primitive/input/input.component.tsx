import { Input } from "heroui-native/input";
import type { ComponentProps } from "react";
import { useCSSVariable } from "uniwind";

export type UiInputProps = ComponentProps<typeof Input>;

/** Locale-neutral placeholder fallback (punctuation, not language). */
const FALLBACK_PLACEHOLDER = ". . .";

export function UiInput({ placeholder, className, style, ...props }: UiInputProps) {
  const accentColor = useCSSVariable("--color-accent") as string;
  const placeholderColor = useCSSVariable("--color-field-placeholder") as string;
  const fontFamily = useCSSVariable("--font-normal") as string;

  return (
    <Input
      placeholder={placeholder ?? FALLBACK_PLACEHOLDER}
      selectionColor={accentColor}
      cursorColor={accentColor}
      placeholderTextColor={placeholderColor}
      className={`font-normal ${className ?? ""}`.trim()}
      style={[{ fontFamily }, style]}
      {...props}
    />
  );
}
