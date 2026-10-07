import { UiView, MonoText, UiPressable } from "../../components";
import type { ControlDef, ControlValues } from "../../hooks/use-controls";
import { SelectControl } from "./select-control";
import { BooleanControl } from "./boolean-control";
import { TextControl } from "./text-control";

interface ControlPanelProps<T extends Record<string, ControlDef>> {
  defs: T;
  values: ControlValues<T>;
  onChange: (key: keyof T, value: string | boolean) => void;
  onReset: () => void;
}

export function ControlPanel<T extends Record<string, ControlDef>>({
  defs,
  values,
  onChange,
  onReset,
}: ControlPanelProps<T>) {
  const entries = Object.entries(defs) as [string, ControlDef][];

  if (entries.length === 0) return null;

  return (
    <UiView className="gap-2">
      <UiView className="flex-row items-center justify-between">
        <MonoText className="text-xs font-semibold text-foreground">Controls</MonoText>
        <UiPressable
          onPress={onReset}
          accessibilityRole="button"
          accessibilityLabel="Reset controls"
        >
          <MonoText className="text-xs text-accent">Reset</MonoText>
        </UiPressable>
      </UiView>
      {entries.map(([key, def]) => {
        const value = values[key];
        if (def.type === "select") {
          return (
            <SelectControl
              key={key}
              label={key}
              options={def.options}
              value={value as string}
              onChange={(v) => onChange(key, v)}
            />
          );
        }
        if (def.type === "boolean") {
          return (
            <BooleanControl
              key={key}
              label={key}
              value={value as boolean}
              onChange={(v) => onChange(key, v)}
            />
          );
        }
        if (def.type === "text") {
          return (
            <TextControl
              key={key}
              label={key}
              value={value as string}
              onChange={(v) => onChange(key, v)}
            />
          );
        }
        return null;
      })}
    </UiView>
  );
}
