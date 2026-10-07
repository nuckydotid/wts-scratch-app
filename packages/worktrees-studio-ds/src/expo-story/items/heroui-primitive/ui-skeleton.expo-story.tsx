import type { ComponentDef } from "./index";
import { UiSkeleton, UiView, UiText } from "../../../components";
import * as C from "./controls";

export const UISkeleton: ComponentDef = {
  label: "UISkeleton",
  category: "heroui-primitive",
  controls: {
    variant: C.select(C.VARIANTS_SHIM, "shimmer"),
    isLoading: C.isLoading,
  },
  render: (p) => (
    <UiView className="w-full gap-2">
      <UiSkeleton
        variant={p.variant as any}
        isLoading={p.isLoading as boolean}
        className="h-4 w-3/4 rounded"
      />
      <UiSkeleton
        variant={p.variant as any}
        isLoading={p.isLoading as boolean}
        className="h-4 w-full rounded"
      />
      <UiSkeleton
        variant={p.variant as any}
        isLoading={p.isLoading as boolean}
        className="h-4 w-1/2 rounded"
      />
      <UiSkeleton
        variant={p.variant as any}
        isLoading={!p.isLoading}
        className="h-4 w-full rounded"
      >
        <UiText className="text-foreground">Content loaded</UiText>
      </UiSkeleton>
    </UiView>
  ),
};
