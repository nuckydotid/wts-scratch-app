import { UiView, UiText, UiRadio, UiRadioGroup } from "../heroui-primitive";

export type OptionSheetOption = {
  readonly label: string;
  readonly value: string;
  readonly color?: string;
  readonly testID?: string;
};

type Props = {
  readonly title: string;
  readonly options: readonly OptionSheetOption[];
  readonly selectedValue?: string;
  readonly onSelect: (value: string) => void;
  readonly onClose: () => void;
};

/**
 * General single-select bottom-sheet content — a title plus radio rows.
 * Selecting an option applies it immediately and closes the sheet (host
 * passes both callbacks, mirroring BlockConfirmSheet's pattern). Radio rows
 * are `RadioGroup.Item` presses so the sheet stays i18n-free.
 */
export function BlockOptionSheet({
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}: Readonly<Props>) {
  return (
    <UiView className="gap-4">
      <UiText className="text-xl font-semibold text-foreground">{title}</UiText>
      <UiRadioGroup
        value={selectedValue}
        onValueChange={(value) => {
          onSelect(value);
          onClose();
        }}
      >
        {options.map((option) => (
          <UiRadioGroup.Item
            key={option.value}
            value={option.value}
            testID={option.testID ?? `option-${option.value}`}
            className="flex-row items-center justify-between px-4 py-3 rounded-2xl bg-surface"
          >
            <UiView className="flex-row items-center gap-3">
              {option.color ? (
                <UiView
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: option.color,
                  }}
                />
              ) : null}
              <UiText className="text-base text-foreground">{option.label}</UiText>
            </UiView>
            <UiRadio>
              <UiRadio.Indicator />
            </UiRadio>
          </UiRadioGroup.Item>
        ))}
      </UiRadioGroup>
    </UiView>
  );
}
