import { UiView } from "../heroui-primitive";
import { useFullSheet } from "../teleport";

export type BlockStepsBarStep = {
  testID?: string;
};

type Props = {
  /** The wizard steps in order — the active index is read from the open
   *  fullsheet's data store (`useFullSheet`), so the bar must render inside a
   *  fullsheet (pinned header slot). Non-pressable by design — navigation is
   *  the footer's Back/Next. Label-less, number-less and icon-less: each
   *  segment is a plain progress pill — the active segment is accent-filled,
   *  completed steps stay highlighted, upcoming steps stay muted. */
  steps: BlockStepsBarStep[];
};

/**
 * Wizard steps indicator for the fullsheet pinned header. Thin progress
 * segments: every FILLED step (completed + active, up to and including the
 * active index) is accent-filled; upcoming steps stay muted.
 */
export function BlockStepsBar({ steps }: Props) {
  const { data } = useFullSheet<{ activeStep?: number }>();
  const activeStep = data?.activeStep ?? 0;

  return (
    <UiView className="flex-row gap-1.5 mb-2">
      {steps.map((step, i) => {
        const tone = i <= activeStep ? "bg-accent" : "bg-muted/10";
        return (
          <UiView key={i} testID={step.testID} className={`flex-1 h-1.5 rounded-full ${tone}`} />
        );
      })}
    </UiView>
  );
}
