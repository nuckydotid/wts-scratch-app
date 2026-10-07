import { useRef, useCallback } from "react";
import type { ComponentDef } from "./index";
import { UiView, UiText, UiButton } from "../../../components";
import { TeleportProvider, useTeleport } from "../../../components/teleport";

function TeleportBsContent() {
  const { showBottomSheet } = useTeleport();
  const countRef = useRef(0);

  const openBasic = useCallback(() => {
    countRef.current += 1;
    const n = countRef.current;
    showBottomSheet(
      <UiView className="gap-3 p-2">
        <UiText type="h3" weight="bold">
          Bottom Sheet #{n}
        </UiText>
        <UiText className="text-muted">
          This is bottom sheet #{n}. Tap &ldquo;Stack More&rdquo; to open another on top.
        </UiText>
        <UiButton
          variant="secondary"
          size="sm"
          onPress={() => {
            countRef.current += 1;
            const m = countRef.current;
            showBottomSheet(
              <UiView className="gap-3 p-2">
                <UiText type="h3" weight="bold">
                  Bottom Sheet #{m}
                </UiText>
                <UiText className="text-muted">
                  Stacked bottom sheet #{m}. Tap backdrop or close button to dismiss this sheet
                  only.
                </UiText>
              </UiView>
            );
          }}
        >
          Stack More
        </UiButton>
      </UiView>
    );
  }, [showBottomSheet]);

  return (
    <UiView className="flex-1 items-center justify-center p-6 gap-4">
      <UiText className="text-lg font-bold text-foreground">BottomSheet</UiText>
      <UiButton variant="primary" size="md" onPress={openBasic}>
        Open Sheet
      </UiButton>
    </UiView>
  );
}

export const TeleportBs: ComponentDef = {
  label: "TeleportBs",
  category: "teleport",
  controls: {},
  render: () => (
    <TeleportProvider>
      <TeleportBsContent />
    </TeleportProvider>
  ),
};
