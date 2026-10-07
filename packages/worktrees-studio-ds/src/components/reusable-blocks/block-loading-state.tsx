import { UiView, UiSpinner } from "../heroui-primitive";

export function BlockLoadingState() {
  return (
    <UiView className="flex-1 items-center justify-center py-16">
      <UiSpinner />
    </UiView>
  );
}
