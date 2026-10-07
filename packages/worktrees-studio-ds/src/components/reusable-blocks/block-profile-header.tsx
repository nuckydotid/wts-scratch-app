import { Image } from "expo-image";
import { UiSkeleton, UiView, UiText } from "../heroui-primitive";
import { BlockSkeletonFade } from "./block-skeleton-fade";

type Props = {
  name: string;
  role?: string;
  avatar?: string;
  pillClassName?: string;
  pillTextClassName?: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  retryLabel: string;
  retryTitle: string;
};

function ProfileHeader({
  name,
  role,
  avatar,
  pillClassName,
  pillTextClassName,
  isLoading,
  isError,
  onRetry,
  retryLabel,
  retryTitle,
}: Props) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  if (isLoading || isError) {
    return (
      <UiView className="items-center gap-3 mb-4">
        <UiSkeleton isLoading variant="pulse" className="w-24 h-24 rounded-full" />
        <UiSkeleton isLoading variant="pulse" className="w-40 h-6 rounded-md" />
        <UiSkeleton isLoading variant="pulse" className="w-24 h-5 rounded-full" />
      </UiView>
    );
  }

  return (
    <UiView className="items-center gap-3 mb-4">
      {avatar ? (
        <Image
          source={{ uri: avatar }}
          style={{ width: 96, height: 96, borderRadius: 48 }}
          contentFit="cover"
        />
      ) : (
        <UiView className="w-24 h-24 rounded-full bg-accent/10 items-center justify-center">
          <UiText className="text-3xl font-bold text-accent">{initial}</UiText>
        </UiView>
      )}
      <UiText className="text-xl font-semibold text-foreground text-center">{name}</UiText>
      {role && (
        <UiView
          className={`rounded-full px-3 py-0.5 self-center ${pillClassName ?? "bg-accent/10"}`}
        >
          <UiText className={`text-xs uppercase text-center ${pillTextClassName ?? "text-accent"}`}>
            {role}
          </UiText>
        </UiView>
      )}
    </UiView>
  );
}

export function BlockProfileHeader(props: Props) {
  return (
    <BlockSkeletonFade isLoading={!!props.isLoading}>
      {(showSkeleton) => (
        <ProfileHeader {...props} isLoading={showSkeleton} isError={props.isError} />
      )}
    </BlockSkeletonFade>
  );
}
