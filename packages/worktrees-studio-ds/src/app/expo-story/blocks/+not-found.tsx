import { UiView, UiText } from "../../../components";

export default function NotFound() {
  return (
    <UiView className="flex-1 items-center justify-center p-6">
      <UiView className="rounded-xl p-6 gap-2 bg-surface">
        <UiText className="text-lg font-bold text-foreground">Component not found</UiText>
        <UiText className="text-sm text-muted">
          The component you are looking for does not exist in the registry.
        </UiText>
      </UiView>
    </UiView>
  );
}
