import { Skeleton } from "heroui-native/skeleton";
import type { ComponentProps } from "react";

export type UiSkeletonProps = ComponentProps<typeof Skeleton>;

export function UiSkeleton(props: UiSkeletonProps) {
  return <Skeleton {...props} />;
}
