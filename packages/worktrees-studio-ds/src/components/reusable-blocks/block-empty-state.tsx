import { UiText, UiView } from "../heroui-primitive";

type Props = {
  testID?: string;
  title: string;
  subtitle?: string;
  className?: string;
};

/**
 * Empty state — minimal centered text pattern.
 * One row of real content: title (and optional subtitle) centered on the surface.
 * Standard rounded card (rounded-2xl) across all screen layouts.
 * No icon, no action button — just the text.
 */
export function BlockEmptyState({ testID, title, subtitle, className }: Readonly<Props>) {
  return (
    <UiView
      testID={testID}
      className={`bg-surface rounded-2xl overflow-hidden px-4 py-3 items-center ${className ?? ""}`}
    >
      <UiText className="text-sm text-muted text-center">{title}</UiText>
      {subtitle ? (
        <UiText className="text-xs text-muted/70 text-center mt-0.5">{subtitle}</UiText>
      ) : null}
    </UiView>
  );
}
