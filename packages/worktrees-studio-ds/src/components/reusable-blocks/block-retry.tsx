import { BlockCenteredState } from "./block-centered-state";

type Props = {
  onRetry?: () => void;
  /** Explicit failure message — same structure as the empty state's title. */
  title: string;
  /** Action wording ("Try again"). */
  label: string;
  testID?: string;
};

/**
 * Centered reload affordance for a block's error state — the shared
 * centered-state card (icon + title + action link), tap the action to retry.
 */
export function BlockRetry({ onRetry, title, label, testID }: Props) {
  return (
    <BlockCenteredState
      icon="refresh"
      title={title}
      actionLabel={label}
      onAction={onRetry}
      actionTestID={testID}
    />
  );
}
