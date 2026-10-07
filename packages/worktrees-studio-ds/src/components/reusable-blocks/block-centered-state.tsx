import { UiPressable, UiText, UiView, UiIcon, type IconName } from "../heroui-primitive";

type Props = {
  icon: IconName;
  rootTestID?: string;
  title: string;
  subtitle?: string;
  /** Tappable action rendered as an accent text link (e.g. retry). */
  actionLabel?: string;
  onAction?: () => void;
  actionTestID?: string;
};

/**
 * Shared centered state card — the surface-container pattern used by both
 * empty states and retry states (icon + title + optional subtitle/action).
 */
export function BlockCenteredState({
  rootTestID,
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  actionTestID,
}: Props) {
  return (
    <UiView
      testID={rootTestID}
      className="bg-surface rounded-xl items-center justify-center py-3 px-8"
    >
      <UiIcon name={icon} size={48} className="text-muted" />
      <UiText className="text-base text-foreground mt-4 text-center">{title}</UiText>
      {subtitle ? (
        <UiText className="text-sm text-muted mt-1 text-center">{subtitle}</UiText>
      ) : null}
      {actionLabel ? (
        <UiPressable onPress={onAction} testID={actionTestID} className="mt-3">
          <UiText className="text-sm font-semibold text-accent text-center">{actionLabel}</UiText>
        </UiPressable>
      ) : null}
    </UiView>
  );
}
