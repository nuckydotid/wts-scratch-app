import {
  UiSkeleton,
  UiText,
  UiCard,
  UiPressable,
  UiView,
  UiIcon,
  type IconName,
} from "../heroui-primitive";
import { BlockRetry } from "./block-retry";
import { BlockSkeletonFade } from "./block-skeleton-fade";

type Props = {
  icon: IconName;
  value: number;
  label: string;
  onPress?: () => void;
  testID?: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  retryLabel: string;
  retryTitle: string;
};

function StatCard({
  icon,
  value,
  label,
  onPress,
  testID,
  isLoading,
  isError,
  onRetry,
  retryLabel,
  retryTitle,
}: Props) {
  if (isLoading) {
    return (
      <UiView className="flex-1 items-center gap-2 p-4">
        <UiSkeleton isLoading variant="pulse" className="w-14 h-14 rounded-2xl" />
        <UiSkeleton isLoading variant="pulse" className="w-16 h-5 rounded-md" />
        <UiSkeleton isLoading variant="pulse" className="w-20 h-3 rounded-md" />
      </UiView>
    );
  }

  if (isError) {
    return (
      <UiView className="flex-1">
        <UiCard variant="default" className="p-4 items-center">
          <BlockRetry onRetry={onRetry} label={retryLabel} title={retryTitle} />
        </UiCard>
      </UiView>
    );
  }

  const card = (
    <UiCard variant="default" className="p-4 items-center gap-2">
      <UiIcon name={icon} size={28} className="text-accent" />
      <UiText className="font-semibold text-2xl text-foreground">{value}</UiText>
      <UiText className="text-xs text-muted text-center">{label}</UiText>
    </UiCard>
  );

  // Without an onPress the stat is informational: no pressable semantics.
  if (!onPress) {
    return (
      <UiView className="flex-1" testID={testID}>
        {card}
      </UiView>
    );
  }

  return (
    <UiPressable onPress={onPress} className="flex-1" testID={testID}>
      {card}
    </UiPressable>
  );
}

export function BlockStatCard(props: Props) {
  return (
    <BlockSkeletonFade isLoading={!!props.isLoading}>
      {(showSkeleton) => <StatCard {...props} isLoading={showSkeleton} isError={props.isError} />}
    </BlockSkeletonFade>
  );
}
