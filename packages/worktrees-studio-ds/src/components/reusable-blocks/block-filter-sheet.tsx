import { useWatch, type UseFormReturn } from "react-hook-form";
import { UiView, UiText, UiChip, UiSearchField } from "../heroui-primitive";

export type FilterFormValues = { q: string; status?: string };
export type FilterState = { q?: string; status?: string };

type Props = {
  form: UseFormReturn<FilterFormValues>;
  title?: string;
  searchPlaceholder?: string;
  searchTestID?: string;
  statusLabel?: string;
  options: { label: string; value?: string }[];
};

export function BlockFilterSheet({
  form,
  title = "Filter",
  searchPlaceholder = "Search...",
  searchTestID,
  statusLabel = "Status",
  options,
}: Props) {
  const status = useWatch({ control: form.control, name: "status" });
  const q = useWatch({ control: form.control, name: "q" });

  return (
    <UiView className="gap-6">
      <UiText className="text-xl font-semibold text-foreground">{title}</UiText>

      <UiSearchField value={q} onChange={(value) => form.setValue("q", value)}>
        <UiSearchField.Group>
          <UiSearchField.SearchIcon />
          <UiSearchField.Input placeholder={searchPlaceholder} testID={searchTestID} />
          <UiSearchField.ClearButton />
        </UiSearchField.Group>
      </UiSearchField>

      <UiView className="gap-2">
        <UiText className="text-sm font-semibold text-foreground">{statusLabel}</UiText>
        <UiView className="flex-row flex-wrap gap-2">
          {options.map((option) => {
            const isSelected = status === option.value;
            return (
              <UiChip
                key={option.label}
                onPress={() => form.setValue("status", option.value, { shouldValidate: true })}
                variant={isSelected ? "secondary" : "soft"}
                color={isSelected ? "accent" : "default"}
              >
                <UiChip.Label>{option.label}</UiChip.Label>
              </UiChip>
            );
          })}
        </UiView>
      </UiView>
    </UiView>
  );
}
