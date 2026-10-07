import { createContext, useContext, useState, type ReactNode } from "react";

export type TextType =
  "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body" | "body-sm" | "body-xs" | "code";
export type TextWeight = "normal" | "medium" | "semibold" | "bold";
type WeightKey = "normal" | "medium" | "semibold" | "bold";
export type FontName = "poppins" | "roboto" | "jakarta" | "nunito";

export const FONT_NAMES: { key: FontName; label: string }[] = [
  { key: "poppins", label: "Poppins" },
  { key: "roboto", label: "Roboto" },
  { key: "jakarta", label: "Jakarta" },
  { key: "nunito", label: "Nunito" },
];

export const FONT_MAP: Record<FontName, Record<WeightKey, string>> = {
  poppins: {
    normal: "Poppins",
    medium: "Poppins-Medium",
    semibold: "Poppins-SemiBold",
    bold: "Poppins-Bold",
  },
  roboto: {
    normal: "Roboto",
    medium: "Roboto-Medium",
    semibold: "Roboto-SemiBold",
    bold: "Roboto-Bold",
  },
  jakarta: {
    normal: "PlusJakartaSans",
    medium: "PlusJakartaSans-Medium",
    semibold: "PlusJakartaSans-SemiBold",
    bold: "PlusJakartaSans-Bold",
  },
  nunito: {
    normal: "NunitoSans",
    medium: "NunitoSans-Medium",
    semibold: "NunitoSans-SemiBold",
    bold: "NunitoSans-Bold",
  },
};

const HEADING_TYPES = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

export function resolveFontFamily(
  font: FontName,
  type?: TextType,
  weight?: TextWeight
): string | undefined {
  const effectiveWeight = weight ? weight : type && HEADING_TYPES.has(type) ? "semibold" : "normal";
  return FONT_MAP[font]?.[effectiveWeight];
}

interface AppFontCtxValue {
  selectedFont: FontName;
  setSelectedFont: (f: FontName) => void;
}

const AppFontCtx = createContext<AppFontCtxValue | null>(null);
const ActiveFontCtx = createContext<FontName | null>(null);

export function AppFontProvider({ children }: { children: ReactNode }) {
  const [selectedFont, setSelectedFont] = useState<FontName>("poppins");
  return <AppFontCtx value={{ selectedFont, setSelectedFont }}>{children}</AppFontCtx>;
}

export function ActiveFontProvider({ children }: { children: ReactNode }) {
  const ctx = useContext(AppFontCtx);
  return <ActiveFontCtx value={ctx?.selectedFont ?? "poppins"}>{children}</ActiveFontCtx>;
}

export function useAppFont() {
  const ctx = useContext(AppFontCtx);
  if (!ctx) throw new Error("useAppFont must be used within AppFontProvider");
  return ctx;
}

export function useActiveFont() {
  return useContext(ActiveFontCtx);
}
