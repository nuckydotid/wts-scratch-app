import { useCallback, useState } from "react";
import { format } from "date-fns";
import { UiView, UiText, UiButton } from "../../../components";
import { TeleportProvider, useDatePickerSheet } from "../../../components/teleport";
import type { ComponentDef } from "./index";

function DatePickerDemo() {
  const datePicker = useDatePickerSheet();
  const [picked, setPicked] = useState<Date | null>(null);

  const openPicker = useCallback(() => {
    datePicker.open({
      confirmLabel: "Confirm",
      title: "Birth Date",
      value: picked ?? new Date(2015, 0, 1),
      onConfirm: setPicked,
    });
  }, [datePicker, picked]);

  return (
    <UiView className="flex-1 items-center justify-center p-6 gap-4">
      <UiText className="text-lg font-bold text-foreground">TeleportDatePicker</UiText>
      <UiText className="text-sm text-muted text-center">
        {picked ? format(picked, "dd MMMM yyyy") : "Nothing picked yet"}
      </UiText>
      <UiButton variant="primary" size="md" onPress={openPicker}>
        Open Date Picker
      </UiButton>
    </UiView>
  );
}

export const TeleportDatePicker: ComponentDef = {
  label: "TeleportDatePicker",
  category: "teleport",
  controls: {},
  render: () => (
    <TeleportProvider>
      <DatePickerDemo />
    </TeleportProvider>
  ),
};
