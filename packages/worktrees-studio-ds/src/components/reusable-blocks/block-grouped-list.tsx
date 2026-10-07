import { Children, isValidElement, type ReactNode } from "react";
import { useFakeRefresh } from "../../lib/timing";
import { RefreshControl } from "react-native";
import type { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useCSSVariable } from "uniwind";
import { UiPressable, UiText, UiView, UiFlatList, UiIcon } from "../heroui-primitive";
import { BlockSkeletonFade } from "./block-skeleton-fade";
import {
  groupedRowClass,
  GroupedListSeparator,
  GroupedListSkeleton,
  type GroupedListSkeletonVariant,
} from "./block-grouped-list-parts";

/** One row of the grouped list — the built-in row visual (icon/avatar left,
 * pill + title + subtitle, badge/right, chevron). */
function GroupedListWrapper(props: Props) {
  return (
    <BlockSkeletonFade isLoading={!!props.isLoading}>
      {(showSkeleton) => (
        <GroupedList {...props} isLoading={showSkeleton} isError={props.isError} />
      )}
    </BlockSkeletonFade>
  );
}

export type GroupedListFieldProps = {
  label: string;
  value?: ReactNode;
  right?: ReactNode;
  testID?: string;
  valueTestID?: string;
  isFirst?: boolean;
  isLast?: boolean;
  layout?: "stacked" | "inline";
};

export function Field({
  label,
  value,
  right,
  testID,
  valueTestID,
  isFirst,
  isLast,
  layout = "stacked",
}: GroupedListFieldProps) {
  const display = value != null && value !== "" ? value : "—";

  if (layout === "inline") {
    return (
      <UiView
        testID={testID}
        className={`bg-surface px-4 py-3.5 flex-row justify-between items-center ${groupedRowClass(
          !!isFirst,
          !!isLast
        )}`}
      >
        <UiText className="text-sm text-muted">{label}</UiText>
        <UiView className="flex-row items-center gap-2">
          {typeof display === "string" || typeof display === "number" ? (
            <UiText testID={valueTestID} className="text-sm font-semibold text-foreground">
              {display}
            </UiText>
          ) : (
            display
          )}
          {right}
        </UiView>
      </UiView>
    );
  }

  return (
    <UiView
      testID={testID}
      className={`bg-surface px-4 py-3 gap-0.5 ${groupedRowClass(!!isFirst, !!isLast)}`}
    >
      <UiText className="text-xs text-muted">{label}</UiText>
      <UiView className="flex-row items-center justify-between">
        {typeof display === "string" || typeof display === "number" ? (
          <UiText testID={valueTestID} className="text-base text-foreground flex-1">
            {display}
          </UiText>
        ) : (
          display
        )}
        {right}
      </UiView>
    </UiView>
  );
}

export type GroupedListSectionHeaderProps = {
  title?: string;
  children?: ReactNode;
  testID?: string;
  className?: string;
};

export function SectionHeader({
  title,
  children,
  testID,
  className = "",
}: GroupedListSectionHeaderProps) {
  return (
    <UiText
      testID={testID}
      className={`text-xs font-semibold uppercase text-muted px-1 mt-6 mb-2 ${className}`}
    >
      {title ?? children}
    </UiText>
  );
}

export const BlockGroupedList = Object.assign(GroupedListWrapper, {
  Row,
  Field,
  SectionHeader,
});
export type { RowProps };

export type GroupedListRow = {
  /** Row key (items mode); optional for direct .Row usage. */
  id?: string;
  title: string;
  subtitle?: string;
  avatar?: string;
  /** Ionicons name for the left slot — renders instead of the avatar/initial. */
  icon?: keyof typeof Ionicons.glyphMap;
  pill?: string;
  pillTone?: "success" | "warning";
  pillTestID?: string;
  badge?: number;
  badgeTestID?: string;
  /** Optional trailing element (e.g. a selection checkmark). */
  right?: ReactNode;
  testID?: string;
  hideAvatar?: boolean;
  onPress?: () => void;
};

type RowProps = GroupedListRow & {
  isFirst?: boolean;
  isLast?: boolean;
};

function Row({
  title,
  subtitle,
  avatar,
  icon,
  pill,
  pillTone = "success",
  pillTestID,
  badge,
  badgeTestID,
  right,
  testID,
  hideAvatar,
  isFirst,
  isLast,
  onPress,
}: RowProps) {
  const initial = title.trim().charAt(0).toUpperCase() || "?";

  return (
    <UiPressable
      onPress={onPress}
      testID={testID}
      className={`bg-surface flex-row items-center px-4 py-3 gap-3 ${groupedRowClass(
        !!isFirst,
        !!isLast
      )}`}
    >
      {icon ? (
        <UiView className="w-12 h-12 rounded-full bg-accent/10 items-center justify-center">
          <UiIcon name={icon} size={22} className="text-accent" />
        </UiView>
      ) : !hideAvatar && avatar ? (
        <Image
          source={{ uri: avatar }}
          style={{ width: 48, height: 48, borderRadius: 24 }}
          contentFit="cover"
        />
      ) : !hideAvatar ? (
        <UiView className="w-12 h-12 rounded-full bg-accent/10 items-center justify-center">
          <UiText className="text-base font-bold text-accent">{initial}</UiText>
        </UiView>
      ) : null}
      <UiView className="flex-1 min-w-0 gap-0.5">
        {pill ? (
          <UiView
            testID={pillTestID}
            className={`self-start rounded-full px-2 py-0.5 ${
              pillTone === "warning" ? "bg-warning/10" : "bg-success/10"
            }`}
          >
            <UiText
              className={`text-xs font-semibold ${
                pillTone === "warning" ? "text-warning" : "text-success"
              }`}
            >
              {pill}
            </UiText>
          </UiView>
        ) : null}
        <UiText className="text-base font-semibold text-foreground">{title}</UiText>
        {subtitle ? <UiText className="text-xs text-muted">{subtitle}</UiText> : null}
      </UiView>
      {badge != null && badge > 0 && (
        <UiView
          testID={badgeTestID}
          className="bg-danger rounded-full min-w-[20px] h-5 items-center justify-center px-1.5"
        >
          <UiText className="text-xs font-bold text-white">{badge > 99 ? "99+" : badge}</UiText>
        </UiView>
      )}
      {right}
      {onPress ? <UiIcon name="chevron-forward" size={18} className="text-foreground" /> : null}
    </UiPressable>
  );
}

type Props = {
  /** Row-data mode — renders the built-in row per item (rounded group). */
  items?: GroupedListRow[];
  /** Custom rows mode — each child is wrapped with the group's rounding. */
  children?: ReactNode;
  /**
   * Pinned first element of the group (children mode only) — e.g. a section
   * header row with a different layout (centered title, larger padding).
   * Always rendered: above the children AND the loading skeleton / error
   * card / empty state. Owns the group's top rounding; the first child row
   * and the skeleton's first row then round only at the bottom.
   */
  headerRow?: ReactNode;
  keyExtractor?: (item: GroupedListRow, index: number) => string;
  /** Override the built-in row rendering for a specific item. */
  renderRow?: (item: GroupedListRow, index: number) => ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  retryLabel: string;
  retryTitle: string;
  rowCount?: number;
  /** Loading row shape — matches the screen's real row layout (default:
   * avatar rows; see GroupedListSkeletonVariant). */
  skeletonVariant?: GroupedListSkeletonVariant;
  className?: string;
  emptyComponent?: ReactNode;
  errorComponent?: ReactNode;
  /**
   * Virtualized engine — renders the items in a FlatList (`BlockGroupedList.Row`
   * as the default row, or `renderRow`) instead of a plain map. Use for LONG
   * lists (rule of thumb: > ~30 rows). The list owns the scroll — never nest
   * a `virtualized` BlockGroupedList inside a ScrollView (same contract as the
   * `TemplateFlatListScreen`). Only valid with `items`.
   */
  virtualized?: boolean;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  /** Pull-to-refresh (virtualized mode). */
  onRefresh?: () => void;
  ListHeaderComponent?: ReactNode;
  ListFooterComponent?: ReactNode;
  contentContainerStyle?: object;
  keyboardShouldPersistTaps?: "always" | "never" | "handled";
};

/**
 * Grouped list container — rounded row cards with a 1px gap. Rows come from
 * `items` (the built-in row: icon/avatar, pill, title, subtitle, badge/right,
 * chevron) or from `children` (custom rows). Loading renders skeleton rows,
 * error a retry card (or `errorComponent`), empty renders `emptyComponent`.
 * `virtualized` swaps the map for a FlatList engine (same rows/states, plus
 * pagination/refresh) for long lists. Virtualized lists (templates) use the
 * `BlockGroupedList.Row` static as the renderItem row.
 */
function GroupedList({
  items,
  children,
  headerRow,
  keyExtractor,
  renderRow,
  className,
  isLoading,
  isError,
  onRetry,
  retryLabel,
  retryTitle,
  rowCount = 1,
  skeletonVariant,
  emptyComponent,
  errorComponent,
  virtualized,
  onEndReached,
  onEndReachedThreshold,
  onRefresh: onRefreshProp,
  ListHeaderComponent,
  ListFooterComponent,
  contentContainerStyle,
  keyboardShouldPersistTaps,
}: Props) {
  const { refreshing, onRefresh } = useFakeRefresh(onRefreshProp);
  const accentColor = useCSSVariable("--color-accent") as string;

  if (isLoading || isError) {
    return (
      <UiView className={`flex flex-col gap-px ${className ?? ""}`}>
        {headerRow != null ? <GroupedHeader>{headerRow}</GroupedHeader> : null}
        <GroupedListSkeleton
          rowCount={rowCount}
          variant={skeletonVariant}
          flatTop={headerRow != null}
        />
      </UiView>
    );
  }

  const count = items?.length ?? Children.count(children);

  if (items != null && count === 0 && emptyComponent) {
    return (
      <UiView className={`flex flex-col gap-px ${className ?? ""}`}>
        {headerRow != null ? <GroupedHeader>{headerRow}</GroupedHeader> : null}
        {headerRow != null ? (
          <UiView className="overflow-hidden rounded-b-2xl">{emptyComponent}</UiView>
        ) : (
          emptyComponent
        )}
      </UiView>
    );
  }

  if (virtualized && items != null) {
    return (
      <UiFlatList
        testID="block-grouped-list-virtualized"
        data={items}
        keyExtractor={(item, index) => keyExtractor?.(item, index) ?? item.id ?? String(index)}
        renderItem={({ item, index }) =>
          (renderRow ? (
            renderRow(item, index)
          ) : (
            <Row {...item} isFirst={index === 0} isLast={index === items.length - 1} />
          )) as React.ReactElement
        }
        ItemSeparatorComponent={GroupedListSeparator as React.ComponentType<any> | null}
        ListHeaderComponent={ListHeaderComponent as React.ComponentType<any> | null}
        ListEmptyComponent={emptyComponent as React.ComponentType<any> | null}
        ListFooterComponent={ListFooterComponent as React.ComponentType<any> | null}
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
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 24,
          flexGrow: 1,
          ...contentContainerStyle,
        }}
      />
    );
  }

  if (items != null) {
    return (
      <UiView className={`flex flex-col gap-px ${className ?? ""}`}>
        {headerRow != null ? <GroupedHeader>{headerRow}</GroupedHeader> : null}
        {items.map((item, i) => {
          const key = keyExtractor?.(item, i) ?? item.id ?? i;
          const row = renderRow ? (
            renderRow(item, i)
          ) : (
            <Row
              key={key}
              {...item}
              isFirst={i === 0 && headerRow == null}
              isLast={i === items.length - 1}
            />
          );
          return (
            <UiView
              key={key}
              className={`overflow-hidden ${groupedRowClass(
                i === 0 && headerRow == null,
                i === items.length - 1
              )}`}
            >
              {row}
            </UiView>
          );
        })}
      </UiView>
    );
  }

  const childRows = Children.toArray(children).filter(isValidElement);
  return (
    <UiView className={`flex flex-col gap-px ${className ?? ""}`}>
      {headerRow != null ? <GroupedHeader>{headerRow}</GroupedHeader> : null}
      {childRows.map((child, i) => (
        <UiView
          key={i}
          className={`overflow-hidden ${groupedRowClass(
            i === 0 && headerRow == null,
            i === childRows.length - 1
          )}`}
        >
          {child}
        </UiView>
      ))}
    </UiView>
  );
}

/** Wraps a `headerRow` — the group's top rounding lives on this element. */
function GroupedHeader({ children }: { children: ReactNode }) {
  return <UiView className="overflow-hidden rounded-t-2xl">{children}</UiView>;
}
