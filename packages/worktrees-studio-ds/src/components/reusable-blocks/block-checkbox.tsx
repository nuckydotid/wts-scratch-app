import { UiIcon, UiPressable, UiView, UiText } from "../heroui-primitive";
import { UiCheckbox } from "../heroui-primitive/checkbox";
import { groupedRowClass } from "./block-grouped-list-parts";

/**
 * Single source of truth for card-list checkboxes — 18×18 square.
 *
 * Why this exists (doc):
 * - All card pickers (admin `BlockSearchableSelectSheet`, teacher `BlockCheckboxSectionList`,
 *   catalog) must share one visual/behavioral contract: square 18×18 rounded-[4px]
 *   border-2, checkmark 12px #fff, whole-row pressable, groupedRowClass rounding,
 *   -checked testID suffix, a11y role=checkbox. See docs/design-system/AGENTS_OVERVIEW.md
 *   "Reusable Blocks" and plan `BlockCheckbox 18×18` (approved 2026-08-24).
 * - `UiCheckbox` (heroui-primitive) stays thin (`ComponentProps<typeof Checkbox>`) for
 *   ControlField forms; card concerns (grouped rounding, bulk, -checked suffix) live here.
 * - Single-select radio remains `BlockGroupedList.Row` with `checkmark-circle 20px` —
 *   not migrated (teacher-subject-picker-sheet.tsx).
 */

type BlockCheckboxProps = {
  isSelected?: boolean;
  isDisabled?: boolean;
  /** Canonical size — 18 for all card lists (catalog previously 20, now unified). */
  size?: 18;
  testID?: string;
  onPress?: () => void;
};

export function BlockCheckbox({
  isSelected,
  isDisabled,
  size = 18,
  testID,
  onPress,
}: BlockCheckboxProps) {
  // UiCheckbox is the primitive square; BlockCheckbox owns card-specific styling.
  // variant="primary" pins accent on bg-surface (avoids auto secondary on surface).
  return (
    <UiPressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!isSelected, disabled: !!isDisabled }}
      disabled={!!isDisabled}
      testID={testID}
      onPress={onPress}
      className={`w-[18px] h-[18px] rounded-[4px] border-2 items-center justify-center ${
        isSelected ? "border-accent bg-accent" : "border-muted bg-transparent"
      }`}
    >
      {isSelected ? <UiIcon name="checkmark" size={12} className="text-white" /> : null}
    </UiPressable>
  );
}

type BlockCheckboxRowProps = {
  label: string;
  subtitle?: string;
  /** Optional code pill (catalog, e.g. S-001) — rendered as bg-accent/10 mono. */
  code?: string;
  description?: string;
  isSelected?: boolean;
  isDisabled?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  rowTestID: string;
  onPress?: () => void;
};

export function BlockCheckboxRow({
  label,
  subtitle,
  code,
  description,
  isSelected,
  isDisabled,
  isFirst,
  isLast,
  rowTestID,
  onPress,
}: BlockCheckboxRowProps) {
  const testID = isSelected ? `${rowTestID}-checked` : rowTestID;
  return (
    <UiPressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: !!isSelected, disabled: !!isDisabled }}
      disabled={!!isDisabled}
      testID={testID}
      onPress={onPress}
      className={`bg-surface flex-row items-center px-4 py-3 gap-3 ${groupedRowClass(
        !!isFirst,
        !!isLast
      )}`}
    >
      <BlockCheckbox isSelected={isSelected} isDisabled={isDisabled} />
      <UiView className="flex-1 min-w-0 gap-0.5">
        <UiView className="flex-row items-center gap-2">
          {code ? (
            <UiView className="bg-accent/10 px-2 py-0.5 rounded">
              <UiText className="text-xs font-bold text-accent font-mono">{code}</UiText>
            </UiView>
          ) : null}
          <UiText className="text-sm font-semibold text-foreground flex-1" numberOfLines={1}>
            {label}
          </UiText>
        </UiView>
        {subtitle ? (
          <UiText className="text-xs text-muted" numberOfLines={1}>
            {subtitle}
          </UiText>
        ) : null}
        {description ? (
          <UiText className="text-xs text-muted" numberOfLines={1}>
            {description}
          </UiText>
        ) : null}
      </UiView>
    </UiPressable>
  );
}
