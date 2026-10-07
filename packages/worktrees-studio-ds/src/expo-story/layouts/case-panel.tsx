import {
  MonoText,
  UiCard,
  UiRadio,
  UiRadioGroup,
  UiScrollView,
  UiText,
  UiView,
} from "../../components";
import type { CaseDef } from "../items/heroui-primitive";

interface CasePanelProps {
  label: string;
  cases: CaseDef[];
  value: string;
  onSelect: (id: string) => void;
}

/** Block-list card of radio rows — one per story case. Replaces the generic
 * controls panel on screen stories. */
export function CasePanel({ label, cases, value, onSelect }: CasePanelProps) {
  return (
    <UiView className="gap-2">
      <UiView className="flex-row items-center justify-between">
        <MonoText className="text-xs font-semibold text-foreground">Cases</MonoText>
        <MonoText className="text-xs text-muted">{cases.length}</MonoText>
      </UiView>
      <UiCard className="rounded-2xl bg-surface">
        <UiCard.Header>
          <UiCard.Title>{label}</UiCard.Title>
          <UiCard.Description>Pick a case to preview that screen state</UiCard.Description>
        </UiCard.Header>
        <UiCard.Body>
          <UiScrollView className="max-h-[540px]">
            <UiRadioGroup value={value} onValueChange={onSelect}>
              {cases.map((c) => (
                <UiRadioGroup.Item key={c.id} value={c.id}>
                  <UiRadio className="flex-1">
                    <UiRadio.Indicator />
                    <UiText
                      className="flex-1 text-sm leading-5 text-foreground"
                      style={{ flexShrink: 1 }}
                    >
                      {c.label}
                    </UiText>
                  </UiRadio>
                </UiRadioGroup.Item>
              ))}
            </UiRadioGroup>
          </UiScrollView>
        </UiCard.Body>
      </UiCard>
    </UiView>
  );
}
