import { Text as RNText } from "react-native";
import type { ComponentProps } from "react";
import { useActiveFont, resolveFontFamily } from "../../../hooks/use-font";

type TextType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body" | "body-sm" | "body-xs";
type TextWeight = "normal" | "medium" | "semibold" | "bold";
type TextAlign = "start" | "center" | "end" | "justify";
type TextColor = "default" | "muted";

export type UiTextProps = ComponentProps<typeof RNText> & {
  type?: TextType;
  weight?: TextWeight;
  align?: TextAlign;
  color?: TextColor;
  truncate?: boolean;
};

const TYPE_CLASSES: Record<string, string> = {
  h1: "text-4xl font-bold",
  h2: "text-2xl font-semibold",
  h3: "text-xl font-semibold",
  h4: "text-lg font-medium",
  h5: "text-base font-medium",
  h6: "text-sm font-medium",
  body: "text-base",
  "body-sm": "text-sm",
  "body-xs": "text-xs",
};

const WEIGHT_CLASSES: Record<string, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const WEIGHT_FROM_CLASS = /font-(normal|medium|semibold|bold)\b/;

function weightFromClassName(classes: string): TextWeight | undefined {
  const m = classes.match(WEIGHT_FROM_CLASS);
  return m ? (m[1] as TextWeight) : undefined;
}

const ALIGN_CLASSES: Record<string, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
  justify: "text-justify",
};

const COLOR_CLASSES: Record<string, string> = {
  default: "text-foreground",
  muted: "text-muted",
};

export function UiText({
  type,
  weight,
  align,
  color = "default",
  truncate,
  className,
  style,
  ...rest
}: UiTextProps) {
  const activeFont = useActiveFont();
  const classes = [
    type ? TYPE_CLASSES[type] || "" : "",
    weight ? WEIGHT_CLASSES[weight] || "" : "",
    align ? ALIGN_CLASSES[align] || "" : "",
    color ? COLOR_CLASSES[color] || "" : "",
    truncate ? "truncate" : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  const effectiveWeight = weight ?? weightFromClassName(classes);
  const fontFamily = activeFont ? resolveFontFamily(activeFont, type, effectiveWeight) : undefined;

  return (
    <RNText className={classes} style={fontFamily ? [{ fontFamily }, style] : style} {...rest} />
  );
}
