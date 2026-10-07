import { UiView, UiText, UiButton, UiIcon, type IconName } from "../heroui-primitive";

type Props = {
  icon?: IconName;
  title: string;
  subtitle?: string;
  onRetry?: () => void;
  retryLabel: string;
  secondaryLabel: string;
  onPressSecondary?: () => void;
};

export function BlockErrorState({
  icon = "alert-circle-outline",
  title,
  subtitle,
  onRetry,
  retryLabel,
  secondaryLabel,
  onPressSecondary,
}: Props) {
  return (
    <UiView className="flex-1 items-center justify-center py-16 px-8">
      <UiIcon name={icon} size={48} className="text-danger" />
      <UiText className="text-base text-foreground mt-4 text-center font-semibold">{title}</UiText>
      {subtitle && <UiText className="text-sm text-muted mt-1 text-center">{subtitle}</UiText>}
      <UiView className="flex-row gap-3 mt-4">
        {onRetry && (
          <UiButton variant="primary" onPress={onRetry}>
            {retryLabel}
          </UiButton>
        )}
        {onPressSecondary && (
          <UiButton variant="secondary" onPress={onPressSecondary}>
            {secondaryLabel}
          </UiButton>
        )}
      </UiView>
    </UiView>
  );
}
