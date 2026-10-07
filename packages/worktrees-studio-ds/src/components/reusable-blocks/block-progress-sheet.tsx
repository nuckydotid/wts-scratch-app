import { UiView, UiText, UiSpinner, UiIcon } from "../heroui-primitive";

export type BlockProgressSheetProps = {
  /** Title of the progress dialog, e.g. "Menyiapkan Video..." */
  title: string;
  /** Optional subtitle or description. */
  description?: string;
  /** Percentage from 0 to 100. If undefined, renders an indeterminate spinner. */
  progress?: number;
  /** TestID for the progress sheet container. */
  testID?: string;
};

/**
 * Reusable progress bottom-sheet view used for long-running foreground operations
 * such as downloading media before sharing.
 */
export function BlockProgressSheet({
  title,
  description,
  progress,
  testID = "block-progress-sheet",
}: BlockProgressSheetProps) {
  const percent =
    progress !== undefined && !Number.isNaN(progress)
      ? Math.min(100, Math.max(0, Math.round(progress)))
      : null;

  return (
    <UiView testID={testID} className="items-center py-3 gap-3">
      <UiView className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
        <UiIcon name="cloud-download-outline" size={24} className="text-accent" />
      </UiView>

      <UiView className="items-center gap-1">
        <UiText className="text-lg font-bold text-foreground text-center">{title}</UiText>
        {description ? (
          <UiText className="text-sm text-muted text-center">{description}</UiText>
        ) : null}
      </UiView>

      {percent !== null ? (
        <UiView className="w-full gap-2 mt-1">
          <UiView className="w-full h-2 rounded-full bg-muted/20 overflow-hidden">
            <UiView
              testID={`${testID}-bar`}
              className="h-full bg-primary rounded-full"
              style={{ width: `${percent}%` }}
            />
          </UiView>
          <UiText
            testID={`${testID}-percent`}
            className="text-xs text-muted font-semibold text-right"
          >
            {percent}%
          </UiText>
        </UiView>
      ) : (
        <UiView testID={`${testID}-spinner`} className="py-2">
          <UiSpinner size="md" />
        </UiView>
      )}
    </UiView>
  );
}
