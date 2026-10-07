import { UiButton, UiText, UiView } from "@repo/worktrees-studio-ds";
import { testIds } from "@repo/worktrees-studio-shared-ids";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import type { JSX } from "react";
import { useAuth } from "@/lib/auth";
import { useChat } from "@/lib/chat";

export default function Home(): JSX.Element {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const unread = useChat((s) => Object.values(s.rooms).reduce((n, r) => n + r.unread, 0));
  return (
    <UiView className="flex-1 items-center justify-center gap-3 bg-background p-6" testID={testIds.screen("home")}>
      <UiText className="text-2xl font-bold text-foreground" testID={testIds.home.title}>
        Hello {user?.name ?? user?.email ?? "there"}
      </UiText>
      <UiText className="text-muted" testID={testIds.home.appName}>
        {Constants.expoConfig?.name}
      </UiText>
      <UiButton onPress={() => router.push("/chat")} testID="open-chat-btn">
        <UiButton.Label>{unread > 0 ? `Chat (${unread})` : "Chat"}</UiButton.Label>
      </UiButton>
      <UiButton variant="tertiary" onPress={() => void useAuth.getState().signOut()} testID="sign-out-btn">
        <UiButton.Label>Sign out</UiButton.Label>
      </UiButton>
    </UiView>
  );
}
