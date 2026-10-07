import Ionicons from "@expo/vector-icons/Ionicons";
import { withUniwind } from "uniwind";
import type { ComponentProps } from "react";

export const UiIcon = withUniwind(Ionicons);
export type UiIconProps = ComponentProps<typeof UiIcon>;
export type IconName = keyof typeof Ionicons.glyphMap;
