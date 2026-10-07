import { TemplateFlatListScreen } from "../../../components/template";
import { UiView, UiText } from "../../../components";
import type { ComponentDef } from "./index";
import * as C from "../heroui-primitive/controls";
import { STORY_BLOCKS } from "../story-texts";

const MOCK_ITEMS = [
  { id: "1", name: "Item One" },
  { id: "2", name: "Item Two" },
  { id: "3", name: "Item Three" },
];

export const TemplateFlatListScreenBlock: ComponentDef = {
  label: "TemplateFlatListScreen",
  category: "templates",
  controls: {
    itemCount: C.select(["0", "3"], "3"),
    showRefresh: C.bool(true),
    isLoading: C.bool(false),
    isError: C.bool(false),
  },
  render: (p) => {
    const items = Number(p.itemCount) > 0 ? MOCK_ITEMS : [];
    return (
      <TemplateFlatListScreen
        retryLabel="Retry"
        retryTitle="Couldn't load"

        header={
          <UiView className="h-10 bg-accent/10 items-center justify-center">
            <UiText className="text-sm text-accent">Header slot</UiText>
          </UiView>
        }
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={(item) => (
          <UiView className="py-3">
            <UiText className="text-foreground">{item.name}</UiText>
          </UiView>
        )}
        ItemSeparatorComponent={<UiView className="h-px bg-separator" />}
        onRefresh={Boolean(p.showRefresh) ? () => {} : undefined}
        isLoading={Boolean(p.isLoading)}
        isError={Boolean(p.isError)}
        emptyComponent={
          <UiView className="flex-1 items-center justify-center py-16">
            <UiText className="text-muted">Empty state slot</UiText>
          </UiView>
        }
      />
    );
  },
};
