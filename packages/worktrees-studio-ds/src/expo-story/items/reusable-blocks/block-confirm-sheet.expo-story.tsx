import { useCallback, useState } from "react";
import { BlockConfirmSheet } from "../../../components/reusable-blocks";
import { UiView, UiText, UiButton } from "../../../components";
import { TeleportProvider, useTeleport } from "../../../components/teleport";
import type { ComponentDef } from "./index";

function ConfirmSheetDemo() {
  const { showBottomSheet, closeBottomSheet } = useTeleport();
  const [confirmed, setConfirmed] = useState(false);

  const openSheet = useCallback(() => {
    const sheetId = showBottomSheet(
      <BlockConfirmSheet
        title="Suspend account?"
        description="The parent cannot sign in until the account is reactivated."
        confirmLabel="Suspend account"
        variant="danger"
        onConfirm={() => setConfirmed(true)}
        onClose={() => closeBottomSheet(sheetId)}
      />
    );
  }, [closeBottomSheet, showBottomSheet]);

  return (
    <UiView className="flex-1 items-center justify-center p-6 gap-4">
      <UiText className="text-lg font-bold text-foreground">BlockConfirmSheet</UiText>
      <UiText className="text-sm text-muted text-center">
        {confirmed ? "Confirmed: account suspended" : "Not confirmed yet"}
      </UiText>
      <UiButton variant="primary" size="md" onPress={openSheet}>
        Open Confirm Sheet
      </UiButton>
    </UiView>
  );
}

export const BlockConfirmSheetBlock: ComponentDef = {
  label: "BlockConfirmSheet",
  category: "reusable blocks",
  controls: {},
  render: () => (
    <TeleportProvider>
      <ConfirmSheetDemo />
    </TeleportProvider>
  ),
};
