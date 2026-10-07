import { useCallback, useState } from "react";
import { BlockOptionSheet } from "../../../components/reusable-blocks";
import { UiView, UiText, UiButton } from "../../../components";
import { TeleportProvider, useTeleport } from "../../../components/teleport";
import type { ComponentDef } from "./index";

function OptionSheetDemo() {
  const { showBottomSheet, closeBottomSheet } = useTeleport();
  const [selected, setSelected] = useState<string | undefined>("id");

  const openSheet = useCallback(() => {
    const sheetId = showBottomSheet(
      <BlockOptionSheet
        title="Language"
        options={[
          { label: "Indonesia", value: "id" },
          { label: "English", value: "en" },
        ]}
        selectedValue={selected}
        onSelect={(value) => setSelected(value)}
        onClose={() => closeBottomSheet(sheetId)}
      />
    );
  }, [closeBottomSheet, selected, showBottomSheet]);

  return (
    <UiView className="flex-1 items-center justify-center p-6 gap-4">
      <UiText className="text-lg font-bold text-foreground">BlockOptionSheet</UiText>
      <UiText className="text-sm text-muted text-center">
        Selected: {selected ?? "none"} — tapping an option applies and closes the sheet
      </UiText>
      <UiButton variant="primary" size="md" onPress={openSheet}>
        Open Option Sheet
      </UiButton>
    </UiView>
  );
}

export const BlockOptionSheetBlock: ComponentDef = {
  label: "BlockOptionSheet",
  category: "reusable blocks",
  controls: {},
  render: () => (
    <TeleportProvider>
      <OptionSheetDemo />
    </TeleportProvider>
  ),
};
