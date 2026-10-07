import { UiCard, UiIcon, UiText, UiView, type IconName } from "../heroui-primitive";

export type TeleportToastVariant = "default" | "success" | "warning" | "danger";

export interface TeleportToastViewProps {
  variant?: TeleportToastVariant;
  title: string;
  description?: string;
  /** E2E hook — defaults to `toast`; pass a unique id per toast type. */
  testID?: string;
}

const iconMap: Record<TeleportToastVariant, IconName> = {
  default: "information-circle",
  success: "checkmark-circle",
  warning: "warning",
  danger: "close-circle",
};

const iconClassNameMap: Record<TeleportToastVariant, string> = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

/**
 * Toast card — auto-dismissed only (no interactive controls) so the
 * non-blocking overlay can never swallow taps meant for the navbar or any
 * other chrome beneath it.
 */
export function TeleportToastView({
  variant = "default",
  title,
  description,
  testID = variant === "default" ? "toast" : `toast-${variant}`,
}: TeleportToastViewProps) {
  return (
    <UiCard
      variant="default"
      className="mx-3 flex-row items-start gap-3"
      testID={testID}
      pointerEvents="none"
    >
      <UiIcon name={iconMap[variant]} size={18} className={iconClassNameMap[variant]} />
      <UiView className="flex-1 gap-0.5">
        <UiText className="font-semibold text-sm text-foreground">{title}</UiText>
        {description && <UiText className="text-xs text-muted">{description}</UiText>}
      </UiView>
    </UiCard>
  );
}
