import type { ReactElement } from "react";
import { UiIcon, UiPressable, UiSectionList, UiText, UiView } from "../heroui-primitive";
import { groupedRowClass } from "./block-grouped-list-parts";

/** One checkbox-section row — the member entry with its own checkbox. */
export type CheckboxSectionItem = {
  id: string;
  title: string;
  testID?: string;
};

/** A checkbox section — rounded header card with a bulk checkbox + member rows. */
export type CheckboxSection = {
  id: string;
  title: string;
  items: CheckboxSectionItem[];
};

type Props = {
  /** Rendered as the list header above the first section (scrolls with the list). */
  header?: ReactElement;
  sections: CheckboxSection[];
  /** Currently selected member ids (checked checkboxes). */
  selectedIds: string[];
  /** Toggle a single member. */
  onToggle: (id: string) => void;
  /** Toggle a whole section (select all when not all selected, else clear). */
  onToggleAll: (section: CheckboxSection) => void;
  /** testID for the section header's bulk checkbox. */
  headerTestIDFor: (section: CheckboxSection) => string;
  /** Read-only presentation (checked state only — all checkboxes + labels
   * inert), e.g. the announcement detail screen. */
  disabled?: boolean;
  /** Disable the list's own scrolling — use when the list is nested inside a
   * parent ScrollView (RN forbids nesting a VirtualizedList in a plain
   * ScrollView of the same orientation; the outer scroll handles movement).
   * e.g. the announcement detail screen's read-only recipient picker. */
  scrollEnabled?: boolean;
  keyboardShouldPersistTaps?: "always" | "never" | "handled";
};

/**
 * Checkbox picker built on a SectionList — the own-scroll counterpart of
 * `BlockSearchableSelectSheet` for sheets that render their content
 * `scrollable={false}` (pickers must own their scroll instead of riding the
 * keyboard-aware wrapper: pressables inside the shared scroll don't receive
 * the responder release on Android). The header (form fields) rides the list
 * as its header so the list spans the full sheet content area (a pinned
 * header would shrink the scroll region off the screen center and Maestro
 * would scroll the host screen behind the sheet). Section headers own the
 * top rounding with a centered title and a bulk checkbox on the right, and
 * member rows are flat with each row's checkbox as the only interaction
 * target.
 */
export function BlockCheckboxSectionList({
  header,
  sections,
  selectedIds,
  onToggle,
  onToggleAll,
  headerTestIDFor,
  disabled = false,
  scrollEnabled,
  keyboardShouldPersistTaps = "handled",
}: Props) {
  const listSections = sections.map((section) => ({
    id: section.id,
    title: section.title,
    data: section.items,
  }));

  return (
    <UiSectionList<CheckboxSectionItem, (typeof listSections)[number]>
      className="flex-1"
      stickySectionHeadersEnabled={false}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      scrollEnabled={scrollEnabled}
      sections={listSections}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={header}
      ItemSeparatorComponent={() => <UiView className="h-px" />}
      renderSectionHeader={({ section }) => {
        const fullSection: CheckboxSection = {
          id: section.id,
          title: section.title,
          items: section.data,
        };
        const allSelected = section.data.every((item) => selectedIds.includes(item.id));
        const isFirstSection = section.id === sections[0]?.id;
        return (
          <UiView className={`overflow-hidden rounded-t-2xl ${isFirstSection ? "" : "mt-3"}`}>
            <UiView className="bg-surface flex-row items-center px-4 py-3 gap-3">
              <UiPressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: allSelected, disabled }}
                disabled={disabled}
                testID={headerTestIDFor(fullSection)}
                onPress={() => onToggleAll(fullSection)}
                className={`w-[18px] h-[18px] rounded-[4px] border-2 items-center justify-center ${
                  allSelected ? "border-accent bg-accent" : "border-muted bg-transparent"
                }`}
              >
                {allSelected ? <UiIcon name="checkmark" size={12} className="text-white" /> : null}
              </UiPressable>
              {/* The section label toggles the bulk checkbox too (tapping the
                  title is the natural target on mobile). */}
              <UiPressable
                className="flex-1 min-w-0"
                disabled={disabled}
                onPress={() => onToggleAll(fullSection)}
              >
                <UiText className="text-sm font-semibold text-foreground">{section.title}</UiText>
              </UiPressable>
            </UiView>
          </UiView>
        );
      }}
      renderItem={({ item, index, section }) => {
        const selected = selectedIds.includes(item.id);
        const isLast = index === section.data.length - 1;
        return (
          <UiView className={`overflow-hidden ${groupedRowClass(false, isLast)}`}>
            <UiView className="bg-surface flex-row items-center pl-10 pr-4 py-3 gap-3">
              <UiPressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected, disabled }}
                disabled={disabled}
                testID={item.testID}
                onPress={() => onToggle(item.id)}
                className={`w-[18px] h-[18px] rounded-[4px] border-2 items-center justify-center ${
                  selected ? "border-accent bg-accent" : "border-muted bg-transparent"
                }`}
              >
                {selected ? <UiIcon name="checkmark" size={12} className="text-white" /> : null}
              </UiPressable>
              {/* The member label toggles its checkbox too. */}
              <UiPressable
                className="flex-1 min-w-0"
                disabled={disabled}
                onPress={() => onToggle(item.id)}
              >
                <UiText className="text-sm font-normal text-foreground">{item.title}</UiText>
              </UiPressable>
            </UiView>
          </UiView>
        );
      }}
      contentContainerStyle={{ paddingBottom: 12, flexGrow: 1 }}
    />
  );
}
