import { UiView, UiText } from "../heroui-primitive";

type Props = { title: string; subtitle: string };

export function BlockScreenHeader({ title, subtitle }: Props) {
  return (
    <UiView className="mb-6">
      <UiText className="text-2xl font-semibold text-foreground mb-1">{title}</UiText>
      <UiText className="text-sm text-muted">{subtitle}</UiText>
    </UiView>
  );
}
