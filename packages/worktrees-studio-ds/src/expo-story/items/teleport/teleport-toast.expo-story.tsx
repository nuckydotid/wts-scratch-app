import type { ComponentDef } from "./index";
import { UiView, UiText, UiButton } from "../../../components";
import { TeleportProvider, useTeleport } from "../../../components/teleport";

const variants = ["default", "success", "warning", "danger"] as const;

function TeleportToastContent() {
  const { showToast } = useTeleport();

  return (
    <UiView className="flex-1 items-center justify-center p-6 gap-4">
      <UiText className="text-lg font-bold text-foreground">Toast</UiText>
      <UiText className="text-muted text-sm text-center">
        Tap a variant to show that toast type. Newest toast lands at the bottom; older ones stack
        upward.
      </UiText>
      {variants.map((v) => (
        <UiButton
          key={v}
          variant="primary"
          size="sm"
          onPress={() =>
            showToast({
              variant: v,
              title: `${v.charAt(0).toUpperCase() + v.slice(1)} toast`,
              description: `This is a ${v} variant toast notification.`,
            })
          }
        >
          {v.charAt(0).toUpperCase() + v.slice(1)}
        </UiButton>
      ))}
    </UiView>
  );
}

export const TeleportToast: ComponentDef = {
  label: "TeleportToast",
  category: "teleport",
  controls: {},
  render: () => (
    <TeleportProvider>
      <TeleportToastContent />
    </TeleportProvider>
  ),
};
