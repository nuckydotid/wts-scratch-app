import { useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { Platform, Appearance } from "react-native";
import { Uniwind, ScopedTheme } from "uniwind";
import { ThemeContext } from "../../hooks/use-theme";
import { DEFAULT_PRIMARY_COLOR } from "../../lib/brand-colors";
export { useTheme } from "../../hooks/use-theme";
// Re-exported for existing importers; canonical home is lib/brand-colors.
export { DEFAULT_PRIMARY_COLOR };

function applyDOMTheme(theme: "light" | "dark") {
  if (Platform.OS !== "web" || typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.dataset.theme = theme;
}

function getInitialTheme(): "light" | "dark" {
  const scheme = Appearance.getColorScheme();
  const theme = scheme === "dark" ? "dark" : "light";
  applyDOMTheme(theme);
  return theme;
}

export function applyPrimaryColorVariables(color: string) {
  try {
    Uniwind.updateCSSVariables("light", {
      "--accent": color,
      "--focus": color,
      "--color-primary": color,
      "--color-accent": color,
    });
    Uniwind.updateCSSVariables("dark", {
      "--accent": color,
      "--focus": color,
      "--color-primary": color,
      "--color-accent": color,
    });
  } catch {
    // Graceful fallback for test/node environments
  }
}

type ThemeProviderProps = {
  readonly children: ReactNode;
  /** Host-provided initial theme (e.g. the app's persisted preference).
   * Defaults to the device color scheme when omitted. */
  readonly initialTheme?: "light" | "dark";
  /** Host-provided initial primary brand color (e.g. from persisted settings).
   * Defaults to #079789 when omitted. */
  readonly initialPrimaryColor?: string;
};

export function ThemeProvider({
  children,
  initialTheme,
  initialPrimaryColor,
}: Readonly<ThemeProviderProps>) {
  const [theme, setTheme] = useState<"light" | "dark">(initialTheme ?? getInitialTheme);
  const [primaryColor, setPrimaryColor] = useState<string>(
    initialPrimaryColor ?? DEFAULT_PRIMARY_COLOR
  );
  const hasInteracted = useRef(false);

  useEffect(() => {
    Uniwind.setTheme(theme);
  }, [theme]);

  useEffect(() => {
    applyPrimaryColorVariables(primaryColor);
  }, [primaryColor]);

  useEffect(() => {
    // The device scheme only seeds the theme when the host has no preference
    // of its own (first install) — once a theme is set explicitly
    // (host-provided initialTheme or a manual switch) the store is the
    // single source of truth.
    if (initialTheme) return;
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      if (hasInteracted.current) return;
      const t = colorScheme === "dark" ? "dark" : "light";
      setTheme(t);
      Uniwind.setTheme(t);
      applyDOMTheme(t);
    });
    return () => sub.remove();
  }, [initialTheme]);

  const handleSetTheme = useCallback((t: "light" | "dark") => {
    hasInteracted.current = true;
    setTheme(t);
    Uniwind.setTheme(t);
    applyDOMTheme(t);
  }, []);

  const handleSetPrimaryColor = useCallback((color: string) => {
    setPrimaryColor(color);
    applyPrimaryColorVariables(color);
  }, []);

  const toggleTheme = useCallback(() => {
    handleSetTheme(theme === "light" ? "dark" : "light");
  }, [theme, handleSetTheme]);

  return (
    <ThemeContext
      value={{
        theme,
        primaryColor,
        toggleTheme,
        setTheme: handleSetTheme,
        setPrimaryColor: handleSetPrimaryColor,
      }}
    >
      <ScopedTheme theme={theme}>{children}</ScopedTheme>
    </ThemeContext>
  );
}
