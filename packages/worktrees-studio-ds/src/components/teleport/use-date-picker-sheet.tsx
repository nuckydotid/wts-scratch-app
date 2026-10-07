import { useCallback } from "react";
import { useTeleport } from "./teleport-context";
import { TeleportDatePickerView } from "./teleport-date-picker-view";

export type DatePickerSheetOptions = {
  value?: Date;
  title?: string;
  confirmLabel: string;
  confirmTestID?: string;
  minYear?: number;
  maxYear?: number;
  /** "date" = day/month/year wheels (default); "month" = month/year only. */
  mode?: "date" | "month";
  /** 12 full month labels (host-localized); defaults to English "MMMM". */
  monthLabels?: string[];
  onConfirm?: (date: Date) => void;
};

export function useDatePickerSheet() {
  const { showBottomSheet, closeBottomSheet } = useTeleport();

  const open = useCallback(
    (options: DatePickerSheetOptions) => {
      const sheetId = showBottomSheet(
        <TeleportDatePickerView
          value={options.value}
          title={options.title}
          confirmLabel={options.confirmLabel}
          confirmTestID={options.confirmTestID}
          minYear={options.minYear}
          maxYear={options.maxYear}
          mode={options.mode}
          monthLabels={options.monthLabels}
          onConfirm={(date) => {
            options.onConfirm?.(date);
            closeBottomSheet(sheetId);
          }}
        />
      );
    },
    [closeBottomSheet, showBottomSheet]
  );

  return { open };
}
