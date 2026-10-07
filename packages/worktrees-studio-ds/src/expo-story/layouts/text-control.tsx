import { UiView, MonoText, UiInput } from "../../components";

interface TextControlProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function TextControl({ label, value, onChange }: TextControlProps) {
  return (
    <UiView className="gap-1">
      <MonoText className="text-xs font-medium text-foreground">{label}</MonoText>
      <UiInput variant="primary" value={value} onChangeText={onChange} placeholder={label} />
    </UiView>
  );
}
