import { SPINNER_ON_ACCENT } from "../../lib/brand-colors";
import { UiButton, UiSpinner, UiView } from "../heroui-primitive";
import { useFullSheet } from "../teleport";

/** Data a fullsheet content publishes for `BlockSheetActionFooter`. */
export type BlockSheetActionFooterData = {
  isBusy?: boolean;
  onAction?: () => void;
};

/**
 * Single primary-action footer for fullsheets: the content publishes
 * `{ isBusy, onAction }` through the sheet data store (`setData`), the footer
 * renders the docked button — matching the other fullsheet footers.
 */
export function BlockSheetActionFooter({
  label,
  testID,
  busyTestID = "submit-spinner",
}: {
  label: string;
  testID: string;
  busyTestID?: string;
}) {
  const { data } = useFullSheet<BlockSheetActionFooterData>();
  const isBusy = data?.isBusy ?? false;
  return (
    <UiView className="flex-row gap-3">
      <UiButton
        variant="primary"
        className="flex-1"
        isDisabled={isBusy || !data?.onAction}
        onPress={() => data?.onAction?.()}
        testID={testID}
      >
        <UiButton.Label>{label}</UiButton.Label>
        {isBusy && <UiSpinner size="sm" color={SPINNER_ON_ACCENT} testID={busyTestID} />}
      </UiButton>
    </UiView>
  );
}
