import { Platform } from "react-native";
import { UiText } from "../text";
import type { UiTextProps } from "../text";

const MONO_FONT = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "Menlo, Monaco, 'Courier New', monospace",
});

export function MonoText({ className, style, ...props }: UiTextProps) {
  return <UiText {...props} className={className} style={[{ fontFamily: MONO_FONT }, style]} />;
}
