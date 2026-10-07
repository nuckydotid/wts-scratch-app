import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { useEffect, useState, type JSX } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_600SemiBold,
  Roboto_700Bold,
} from "@expo-google-fonts/roboto";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  NunitoSans_400Regular,
  NunitoSans_500Medium,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
} from "@expo-google-fonts/nunito-sans";
import { UiView, UiText } from "../components";
import { ThemeProvider } from "../components/providers/theme-provider";
import { AppFontProvider } from "../hooks/use-font";
import { ensureAssetsCached } from "../lib/asset-url";

import "../global.css";

/** Dev-shell loading label (DS is i18n-free; never shipped in product UI). */
const LOADING_LABEL = "Loading...";

function LoadingScreen() {
  return (
    <UiView className="flex-1 items-center justify-center bg-background">
      <UiText className="text-foreground">{LOADING_LABEL}</UiText>
    </UiView>
  );
}

function RootLayoutInner(): JSX.Element {
  const [fontsLoaded] = useFonts({
    Poppins: Poppins_400Regular,
    "Poppins-Medium": Poppins_500Medium,
    "Poppins-SemiBold": Poppins_600SemiBold,
    "Poppins-Bold": Poppins_700Bold,
    Roboto: Roboto_400Regular,
    "Roboto-Medium": Roboto_500Medium,
    "Roboto-SemiBold": Roboto_600SemiBold,
    "Roboto-Bold": Roboto_700Bold,
    PlusJakartaSans: PlusJakartaSans_400Regular,
    "PlusJakartaSans-Medium": PlusJakartaSans_500Medium,
    "PlusJakartaSans-SemiBold": PlusJakartaSans_600SemiBold,
    "PlusJakartaSans-Bold": PlusJakartaSans_700Bold,
    NunitoSans: NunitoSans_400Regular,
    "NunitoSans-Medium": NunitoSans_500Medium,
    "NunitoSans-SemiBold": NunitoSans_600SemiBold,
    "NunitoSans-Bold": NunitoSans_700Bold,
  });

  const [cacheReady, setCacheReady] = useState(false);

  useEffect(() => {
    ensureAssetsCached().finally(() => setCacheReady(true));
  }, []);

  const ready = fontsLoaded && cacheReady;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <HeroUINativeProvider>
          {/* KeyboardProvider is REQUIRED for the story gallery — without it the
              full sheets' KeyboardAwareScrollView receives no keyboard events and
              forms never become scrollable / inputs stay covered (the host apps
              get it via DsProvider). */}
          <KeyboardProvider>
            <AppFontProvider>
              {ready ? <Stack screenOptions={{ headerShown: false }} /> : <LoadingScreen />}
            </AppFontProvider>
          </KeyboardProvider>
        </HeroUINativeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout(): JSX.Element {
  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}
