import "@/ui/global.css";

import { DsProvider } from "@repo/worktrees-studio-ds";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { Stack } from "expo-router";
import type { JSX } from "react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useChat } from "@/lib/chat";
import { loginPush, logoutPush } from "@/lib/push";

export default function RootLayout(): JSX.Element | null {
  const [queryClient] = useState(() => new QueryClient());
  const [fontsLoaded] = useFonts({
    Poppins: Poppins_400Regular,
    "Poppins-Medium": Poppins_500Medium,
    "Poppins-SemiBold": Poppins_600SemiBold,
    "Poppins-Bold": Poppins_700Bold,
  });
  const brand = Constants.expoConfig?.extra?.brand as { primary?: string } | undefined;
  const user = useAuth((s) => s.user);
  const ready = useAuth((s) => s.ready);
  const url = Linking.useURL();

  useEffect(() => useAuth.getState().start(), []);

  // Email-link sign-in: the link opens the app (or the web page) with the one-time code in the URL.
  useEffect(() => {
    if (url) void useAuth.getState().completeEmailLink(url).catch(() => {});
  }, [url]);

  // Realtime chat + push live exactly as long as someone is signed in.
  const uid = user?.uid;
  useEffect(() => {
    if (!uid) return;
    useChat.getState().connect();
    void loginPush(uid);
    return () => {
      useChat.getState().disconnect();
      void logoutPush();
    };
  }, [uid]);

  if (!fontsLoaded || !ready) return null;
  return (
    <QueryClientProvider client={queryClient}>
      <DsProvider initialPrimaryColor={brand?.primary}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={!user}>
            <Stack.Screen name="sign-in" />
          </Stack.Protected>
          <Stack.Protected guard={!!user}>
            <Stack.Screen name="(app)" />
          </Stack.Protected>
        </Stack>
      </DsProvider>
    </QueryClientProvider>
  );
}
