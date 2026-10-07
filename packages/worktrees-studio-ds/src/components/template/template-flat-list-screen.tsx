import { type ReactNode } from "react";
import { useFakeRefresh } from "../../lib/timing";
import { RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";
import { UiView, UiFlatList } from "../heroui-primitive";
import { BlockSkeletonFade } from "../reusable-blocks/block-skeleton-fade";
import {
  GroupedListSkeleton,
  type GroupedListSkeletonVariant,
} from "../reusable-blocks/block-grouped-list-parts";

type Props<T> = {
  header?: ReactNode;
  footer?: ReactNode;
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => ReactNode;
  /** Element, or a render function receiving the neighboring rows (skip
   * separators around headers, etc.). */
  ItemSeparatorComponent?:
    ReactNode | ((info: { leadingItem?: T; trailingItem?: T }) => ReactNode | null);
  ListHeaderComponent?: ReactNode;
  ListFooterComponent?: ReactNode;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  isLoading?: boolean;
  /** Loading row shape — see GroupedListSkeletonVariant. */
  skeletonVariant?: GroupedListSkeletonVariant;
  isError?: boolean;
  emptyComponent?: ReactNode;
  errorComponent?: ReactNode;
  onRetry?: () => void;
  retryLabel: string;
  retryTitle: string;
  /** Number of skeleton groups to show while loading. Default 1. */
  skeletonRowCount?: number;
  /** Bottom clearance for persistent chrome (e.g. the tab bar). */
  contentPaddingBottom?: number;
  contentContainerStyle?: object;
  stickyHeaderIndices?: number[];
  testID?: string;
};

export function TemplateFlatListScreen<T>({
  header,
  footer,
  data,
  keyExtractor,
  renderItem,
  ItemSeparatorComponent,
  ListHeaderComponent,
  ListFooterComponent,
  onRefresh: onRefreshProp,
  onEndReached,
  onEndReachedThreshold,
  isLoading,
  skeletonVariant,
  isError,
  emptyComponent,
  errorComponent,
  onRetry,
  retryLabel,
  retryTitle,
  skeletonRowCount = 1,
  contentPaddingBottom,
  contentContainerStyle,
  stickyHeaderIndices,
  testID,
}: Readonly<Props<T>>) {
  const { refreshing, onRefresh } = useFakeRefresh(onRefreshProp);
  const accentColor = useCSSVariable("--color-accent") as string;
  // Pushed screens sit above the system navigation bar — pad the list's end
  // so the last rows are never blocked by it.
  const insets = useSafeAreaInsets();

  const resolvedItemSeparator = (() => {
    if (typeof ItemSeparatorComponent === "function") {
      return ItemSeparatorComponent as React.ComponentType<any>;
    }
    if (ItemSeparatorComponent) {
      return () => ItemSeparatorComponent as React.ReactElement;
    }
    return null;
  })();

  return (
    <UiView testID={testID} className="flex-1 bg-background overflow-hidden">
      {header ? <UiView className="z-10 bg-background">{header}</UiView> : null}
      <BlockSkeletonFade isLoading={!!(isLoading || isError)} style={{ flex: 1 }}>
        {(showSkeleton) =>
          showSkeleton ? (
            <UiView className="flex-1 px-4 pt-4 gap-4">
              {Array.from({ length: skeletonRowCount }, (_, i) => (
                <GroupedListSkeleton key={i} rowCount={1} variant={skeletonVariant} />
              ))}
            </UiView>
          ) : (
            <UiFlatList
              data={data}
              keyExtractor={keyExtractor}
              renderItem={({ item, index }) => renderItem(item, index) as React.ReactElement}
              ItemSeparatorComponent={resolvedItemSeparator}
              ListHeaderComponent={ListHeaderComponent as React.ComponentType<any> | null}
              ListEmptyComponent={emptyComponent as React.ComponentType<any> | null}
              ListFooterComponent={ListFooterComponent as React.ComponentType<any> | null}
              stickyHeaderIndices={stickyHeaderIndices}
              onEndReached={onEndReached}
              onEndReachedThreshold={onEndReachedThreshold}
              refreshControl={
                onRefreshProp ? (
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={accentColor}
                    colors={[accentColor]}
                  />
                ) : undefined
              }
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingTop: stickyHeaderIndices && stickyHeaderIndices.length > 0 ? 0 : 16,
                paddingBottom: contentPaddingBottom ?? 24 + insets.bottom,
                flexGrow: 1,
                ...contentContainerStyle,
              }}
            />
          )
        }
      </BlockSkeletonFade>
      {footer}
    </UiView>
  );
}
