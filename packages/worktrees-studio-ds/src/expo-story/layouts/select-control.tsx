import { UiView, MonoText, UiChip, Chip } from "../../components";

interface SelectControlProps {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}

export function SelectControl({ label, options, value, onChange }: SelectControlProps) {
  return (
    <UiView className="gap-1">
      <MonoText className="text-xs font-medium text-foreground">{label}</MonoText>
      <UiView className="flex-row flex-wrap gap-1">
        {options.map((opt) => (
          <UiChip
            key={opt}
            size="sm"
            onPress={() => onChange(opt)}
            variant={value === opt ? "primary" : "soft"}
            color={value === opt ? "accent" : "default"}
          >
            <Chip.Label>{opt}</Chip.Label>
          </UiChip>
        ))}
      </UiView>
    </UiView>
  );
}
