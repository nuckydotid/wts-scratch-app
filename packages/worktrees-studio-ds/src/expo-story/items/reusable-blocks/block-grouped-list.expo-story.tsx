import { BlockGroupedList } from "../../../components/reusable-blocks";
import { UiText, UiView } from "../../../components";
import type { ComponentDef } from "./index";
import * as C from "../heroui-primitive/controls";

function Item({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <UiView className="bg-surface px-4 py-3 gap-0.5">
      <UiText className="text-base font-semibold text-foreground">{title}</UiText>
      {subtitle && <UiText className="text-xs text-muted">{subtitle}</UiText>}
    </UiView>
  );
}

export const BlockGroupedListBlock: ComponentDef = {
  label: "BlockGroupedList",
  category: "reusable blocks",
  controls: {
    itemCount: C.select(["1", "2", "3", "5"], "5"),
    isLoading: C.bool(false),
    isError: C.bool(false),
    useRows: C.bool(false),
  },
  render: (p) => (
    <BlockGroupedList
      retryLabel="Retry"
      retryTitle="Couldn't load"
      isLoading={Boolean(p.isLoading)}
      isError={Boolean(p.isError)}
      items={
        p.useRows
          ? [
              {
                id: "1",
                title: "Students",
                subtitle: "View class students",
                icon: "people-outline",
              },
              {
                id: "2",
                title: "Attendance",
                subtitle: "Mark daily attendance",
                icon: "calendar-outline",
              },
              {
                id: "3",
                title: "Grades",
                subtitle: "Manage subjects and scores",
                icon: "clipboard-outline",
              },
            ]
          : undefined
      }
    >
      {Array.from({ length: Number(p.itemCount) }).map((_, i) => (
        <Item key={i} title={`Item ${i + 1}`} subtitle={`Subtitle ${i + 1}`} />
      ))}
    </BlockGroupedList>
  ),
};
