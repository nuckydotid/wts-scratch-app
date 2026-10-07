import { createContext, useContext } from "react";
import { DEFAULT_PRIMARY_COLOR } from "../lib/brand-colors";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  primaryColor: string;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setPrimaryColor: (color: string) => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  primaryColor: DEFAULT_PRIMARY_COLOR,
  toggleTheme: () => {},
  setTheme: () => {},
  setPrimaryColor: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}
