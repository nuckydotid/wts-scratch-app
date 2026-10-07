import { useEffect, useRef } from "react";
import { useOptionalFullSheet } from "./teleport-context";
import type { BlockSheetActionFooterData } from "../reusable-blocks/block-sheet-action-footer";

/**
 * Publishes a sheet's docked footer action (`BlockSheetActionFooter`) without
 * identity-loop footguns: the context value and the handler change on every
 * provider/content render, so the publish effect depends on `isBusy` only and
 * reads the latest handler through a ref.
 *
 * Usage (inside fullsheet content):
 * `useFullSheetFooterAction({ isBusy: isSaving, onAction: handleSave });`
 */
export function useFullSheetFooterAction({
  isBusy,
  onAction,
}: {
  isBusy: boolean;
  onAction: () => void | Promise<void>;
}): void {
  const fullSheet = useOptionalFullSheet();
  const actionRef = useRef<{
    setData?: (data: BlockSheetActionFooterData) => void;
    onAction?: () => void | Promise<void>;
  }>({});

  // Sync refs after every render: keeps `setData`/`onAction` current without
  // making them effect dependencies.
  useEffect(() => {
    actionRef.current.setData = fullSheet?.setData as
      ((data: BlockSheetActionFooterData) => void) | undefined;
    actionRef.current.onAction = onAction;
  });

  // Publish once on mount and on each busy flip — never per render.
  useEffect(() => {
    actionRef.current.setData?.({
      isBusy,
      onAction: () => {
        void actionRef.current.onAction?.();
      },
    });
  }, [isBusy]);
}
