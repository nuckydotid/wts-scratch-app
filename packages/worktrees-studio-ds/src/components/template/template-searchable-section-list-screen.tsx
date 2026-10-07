import { useMemo, useState, type ComponentType, type ReactElement, type ReactNode } from "react";
import { RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";
import { useDebouncedSearch, useFakeRefresh } from "../../lib/timing";
import { UiView, UiText, UiSectionList, UiSearchField, UiSpinner } from "../heroui-primitive";
import { BlockEmptyState } from "../reusable-blocks/block-empty-state";
import { BlockSkeletonFade } from "../reusable-blocks/block-skeleton-fade";
import { GroupedListSkeleton } from "../reusable-blocks/block-grouped-list-parts";

type Section<T extends { id: string }> = {
  title: string;
  data: T[];
};

type Props<T extends { id: string }> = {
  header?: ReactNode;
  footer?: ReactNode;
  searchPlaceholder: string;
  /** "external" moves search to the navbar action sheet (no inline field). */
  searchMode?: "inline" | "external";
  /** Month-year grouped rows (students). When absent, `items` renders flat (teachers). */
  sections?: Section<T>[];
  items?: T[];
  isLoading?: boolean;
  isError?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  emptyLabel: string;
  emptyComponent?: ReactElement | ComponentType<unknown> | null;
  errorComponent?: ReactNode;
  searchTestID?: string;
  listTestID?: string;
  loadingTestID?: string;
  searchClassName?: string;
  sectionHeaderTestIDPrefix?: string;
  /** Called 700ms after the query stops changing — the host resets its page cursor. */
  onSearchChange: (query: string) => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  onRetry?: () => void;
  retryLabel: string;
  retryTitle: string;
  onRefresh?: () => void;
  keyExtractor: (item: T) => string;
  /** Receives per-section first/last flags for grouped-card rounding. */
  renderItem: (info: {
    item: T;
    index: number;
    section: { title: string };
    isFirst: boolean;
    isLast: boolean;
  }) => ReactElement | null;
  contentContainerStyle?: object;
  keyboardShouldPersistTaps?: "always" | "never" | "handled";
  contentPaddingBottom?: number;
  testID?: string;
};

function rowSeparator() {
  return <UiView className="h-px" />;
}

/**
 * Searchable, sectioned list screen shell — the structural engine behind the
 * assignment pickers (`BlockSearchableSelectSheet`) and browse lists (student
 * list). Owns the search field (700ms debounced `onSearchChange`), the
 * `UiSectionList` body (month-year sections or flat items), end-reached
 * pagination (guarded by `hasMore`/`isLoadingMore`), pull-to-refresh, and the
 * list states (pulse skeleton rows on first load, centered `BlockRetry` on
 * error, empty state). Rows render through the host's `renderItem` with
 * per-section first/last flags for grouped-card rounding.
 */
export function TemplateSearchableSectionListScreen<T extends { id: string }>({
  header,
  footer,
  searchPlaceholder,
  searchMode = "inline",
  sections,
  items,
  isLoading,
  isError,
  isLoadingMore,
  hasMore,
  emptyLabel,
  retryLabel,
  retryTitle,
  emptyComponent,
  errorComponent,
  searchTestID = "search-input",
  listTestID = "searchable-list",
  loadingTestID = "searchable-loading",
  searchClassName,
  sectionHeaderTestIDPrefix,
  onSearchChange,
  onEndReached,
  onEndReachedThreshold,
  onRetry,
  onRefresh: onRefreshProp,
  keyExtractor,
  renderItem,
  contentContainerStyle,
  keyboardShouldPersistTaps = "handled",
  contentPaddingBottom,
  testID,
}: Readonly<Props<T>>) {
  const sectionOrder = useMemo(() => (sections ?? []).map((s) => s.title), [sections]);
  const [query, setQuery] = useState("");
  const { refreshing, onRefresh } = useFakeRefresh(onRefreshProp);
  const accentColor = useCSSVariable("--color-accent") as string;
  const insets = useSafeAreaInsets();

  // The debounce must NOT re-arm when the host's callback identity changes
  // (hosts often pass inline arrows) — that restarts the timer on every
  // parent re-render and keeps re-rendering the list around user taps. Kept
  // in useDebouncedSearch: latest callback in a ref, timer depends on query.
  useDebouncedSearch(query, onSearchChange);

  const listSections = (sections?.length ? sections : [{ title: "", data: items ?? [] }]).filter(
    (section) => section.data.length > 0
  );

  return (
    <UiView testID={testID} className="flex-1 bg-background overflow-hidden" focusable={true}>
      {header}
      {searchMode === "inline" ? (
        <UiView className={searchClassName ?? "px-4 pt-2 pb-2"} focusable={true}>
          <UiSearchField value={query} onChange={setQuery}>
            <UiSearchField.Group>
              <UiSearchField.SearchIcon />
              <UiSearchField.Input placeholder={searchPlaceholder} testID={searchTestID} />
              <UiSearchField.ClearButton />
            </UiSearchField.Group>
          </UiSearchField>
        </UiView>
      ) : (
        // External search (navbar action sheet) — keep the list clear of the
        // navbar with the same breathing room the inline field used to give.
        <UiView className="pt-2 pb-2" />
      )}

      <BlockSkeletonFade isLoading={!!(isLoading || isError)} style={{ flex: 1 }}>
        {(showSkeleton) =>
          showSkeleton ? (
            <UiView className="flex-1 px-4 pt-2" testID={loadingTestID}>
              <GroupedListSkeleton rowCount={1} />
            </UiView>
          ) : (
            <UiSectionList
              testID={listTestID}
              className="flex-1"
              keyboardShouldPersistTaps={keyboardShouldPersistTaps}
              sections={listSections}
              keyExtractor={keyExtractor}
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
              renderItem={({ item, index, section }) =>
                renderItem({
                  item,
                  index,
                  section: { title: String(section.title ?? "") },
                  isFirst: index === 0,
                  isLast: index === section.data.length - 1,
                })
              }
              renderSectionHeader={({ section: s }) => {
                const idx = sectionOrder.indexOf(s.title);
                return s.title ? (
                  <UiText
                    testID={
                      sectionHeaderTestIDPrefix && idx >= 0
                        ? `${sectionHeaderTestIDPrefix}-${idx}`
                        : undefined
                    }
                    className="text-xs font-semibold text-muted uppercase pt-2 pb-2 bg-background"
                  >
                    {s.title}
                  </UiText>
                ) : null;
              }}
              ItemSeparatorComponent={rowSeparator}
              ListEmptyComponent={
                emptyComponent ?? (
                  <UiView className="pt-2">
                    <BlockEmptyState title={emptyLabel} />
                  </UiView>
                )
              }
              ListFooterComponent={
                isLoadingMore ? (
                  <UiView className="py-4 items-center">
                    <UiSpinner />
                  </UiView>
                ) : null
              }
              onEndReached={() => {
                if (hasMore && !isLoadingMore) onEndReached?.();
              }}
              onEndReachedThreshold={onEndReachedThreshold}
              contentContainerStyle={{
                paddingHorizontal: 16,
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
