import { Platform } from "react-native";
import { UiView, UiTextInput, UiIcon } from "../../components";

const MONO_FONT = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "Menlo, Monaco, 'Courier New', monospace",
});

interface SearchInputProps {
  value: string;
  onChange: (text: string) => void;
}

export function SearchInput({ value, onChange }: Readonly<SearchInputProps>) {
  return (
    <UiView className="px-3 py-1.5">
      <UiView className="flex-row items-center gap-2 rounded-lg px-2.5 h-8 bg-field">
        <UiIcon name="search" size={16} className="text-muted" />
        <UiTextInput
          className="flex-1 text-sm text-foreground"
          placeholder="Find component..."
          value={value}
          onChangeText={onChange}
          style={{ fontFamily: MONO_FONT }}
        />
      </UiView>
    </UiView>
  );
}
