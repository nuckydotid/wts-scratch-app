import { UiView, MonoText, UiSwitch } from "../../components";

interface BooleanControlProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function BooleanControl({ label, value, onChange }: BooleanControlProps) {
  return (
    <UiView className="flex-row items-center justify-between">
      <MonoText className="text-xs font-medium text-foreground">{label}</MonoText>
      <UiSwitch isSelected={value} onSelectedChange={onChange} />
    </UiView>
  );
}
