import type { ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { HeroUINativeProvider } from "heroui-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ThemeProvider } from "./theme-provider";
import { AppFontProvider, ActiveFontProvider } from "../../hooks/use-font";
import { TeleportProvider } from "../teleport";

/**
 * Composed provider stack for host apps. Provides theme, fonts, keyboard
 * handling, and the teleport overlay system with a single import.
 */
type DsProviderProps = {
  readonly children: ReactNode;
  /** Initial theme (e.g. the app's persisted preference) — the single
   * source of truth instead of the device color scheme. */
  readonly initialTheme?: "light" | "dark";
  /** Initial primary brand color (e.g. the app's persisted preference).
   * Defaults to #079789 when omitted. */
  readonly initialPrimaryColor?: string;
};

export function DsProvider({
  children,
  initialTheme,
  initialPrimaryColor,
}: Readonly<DsProviderProps>) {
  return (
    <ThemeProvider initialTheme={initialTheme} initialPrimaryColor={initialPrimaryColor}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <HeroUINativeProvider>
            <KeyboardProvider>
              <AppFontProvider>
                <ActiveFontProvider>
                  <TeleportProvider>{children}</TeleportProvider>
                </ActiveFontProvider>
              </AppFontProvider>
            </KeyboardProvider>
          </HeroUINativeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
