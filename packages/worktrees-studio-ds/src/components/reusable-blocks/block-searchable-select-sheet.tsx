import { UiView, UiText } from "../heroui-primitive";
import type { ReactNode } from "react";
import { TemplateSearchableSectionListScreen } from "../template";
import { BlockCheckboxRow } from "./block-checkbox";

export type SearchableSelectOption = {
  id: string;
  label: string;
  subtitle?: string;
};

export type SearchableSelectSection = {
  title: string;
  data: SearchableSelectOption[];
};

type Props = {
  title: string;
  searchPlaceholder: string;
  checkedIds: Set<string>;
  /** Month-year grouped rows (students). When absent, `items` renders flat (teachers). */
  sections?: SearchableSelectSection[];
  items?: SearchableSelectOption[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  emptyLabel: string;
  sectionHeaderTestIDPrefix?: string;
  retryLabel: string;
  retryTitle: string;
  searchTestID?: string;
  listTestID?: string;
  rowTestIDPrefix?: string;
  /** Called 700ms after the query stops changing. */
  onSearchChange: (query: string) => void;
  onToggle: (id: string) => void;
  onLoadMore: () => void;
  /** Docked below the list (e.g. the host's single-select submit). */
  footer?: ReactNode;
};

/**
 * Full-sheet assignment picker — searchable, paginated checkbox list where
 * checked ids mirror the current membership (unchecking removes). Students
 * render as month-year sections, teachers as a flat list. Search is debounced
 * (700ms); the host resets its page cursor on `onSearchChange`. Built on the
 * `TemplateSearchableSectionListScreen` shell (search + sections + pagination
 * + states). The host renders the submit in the sheet's pinned footer bar
 * (BlockFormSubmit-style) — this block is content-only.
 */
export function BlockSearchableSelectSheet({
  title,
  searchPlaceholder,
  checkedIds,
  sections,
  items,
  isLoading,
  isLoadingMore,
  hasMore,
  emptyLabel,
  sectionHeaderTestIDPrefix,
  retryLabel,
  retryTitle,
  searchTestID = "search-input",
  listTestID = "searchable-list",
  rowTestIDPrefix = "searchable-row",
  onSearchChange,
  onToggle,
  onLoadMore,
  footer,
}: Props) {
  return (
    <TemplateSearchableSectionListScreen<SearchableSelectOption>
      header={<UiText className="text-xl font-semibold text-foreground">{title}</UiText>}
      searchPlaceholder={searchPlaceholder}
      sections={sections}
      items={items}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      emptyLabel={emptyLabel}
      sectionHeaderTestIDPrefix={sectionHeaderTestIDPrefix}
      retryLabel={retryLabel}
      retryTitle={retryTitle}
      searchTestID={searchTestID}
      listTestID={listTestID}
      searchClassName="pt-2 pb-2"
      onSearchChange={onSearchChange}
      onEndReached={onLoadMore}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingHorizontal: 0 }}
      renderItem={({ item, isFirst, isLast }) => (
        <BlockCheckboxRow
          label={item.label}
          subtitle={item.subtitle}
          isSelected={checkedIds.has(item.id)}
          isFirst={isFirst}
          isLast={isLast}
          rowTestID={`${rowTestIDPrefix}-${item.id}`}
          onPress={() => onToggle(item.id)}
        />
      )}
      footer={footer}
    />
  );
}
