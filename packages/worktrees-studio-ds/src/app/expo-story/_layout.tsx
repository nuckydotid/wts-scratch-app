import { Stack } from "expo-router";
import { useRef } from "react";
import type { View } from "react-native";
import { UiView } from "../../components";
import { CollabHeader, CollabSidePanelHost, StoryCollabProvider } from "../../expo-story/collab";
import { Toolbar } from "../../expo-story/layouts/toolbar";
import { Sidebar } from "../../expo-story/layouts/sidebar";

export default function StorybookLayout() {
  // Interacting with this area ends "following" a teammate (web collaboration only).
  const surface = useRef<View>(null);
  return (
    <StoryCollabProvider>
      <UiView className="flex-1 bg-background">
        <Toolbar />
        <CollabHeader surface={surface} />
        <UiView className="flex-1 flex-row">
          <Sidebar />
          <UiView ref={surface} className="flex-1 bg-background">
            <Stack screenOptions={{ headerShown: false }} />
          </UiView>
          <CollabSidePanelHost />
        </UiView>
      </UiView>
    </StoryCollabProvider>
  );
}
