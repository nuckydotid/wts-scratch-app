import { TemplateSearchableSectionListScreen } from "../../../components/template";
import { UiView, UiText, UiPressable } from "../../../components";
import type { ComponentDef } from "./index";
import * as C from "../heroui-primitive/controls";
import { STORY_BLOCKS } from "../story-texts";

const MOCK_SECTIONS = [
  {
    title: "August - 2025",
    data: [
      { id: "s1", name: "Aisyah Putri" },
      { id: "s2", name: "Zahra Ramadhani" },
    ],
  },
  {
    title: "July - 2025",
    data: [{ id: "s3", name: "Fathan Alfarizi" }],
  },
];

const MOCK_ITEMS = [
  { id: "t1", name: "Siti Aminah" },
  { id: "t2", name: "Ahmad Fauzi" },
];

function roundingClass(isFirst: boolean, isLast: boolean): string {
  if (isFirst && isLast) return "rounded-2xl";
  if (isFirst) return "rounded-t-2xl";
  if (isLast) return "rounded-b-2xl";
  return "";
}

export const TemplateSearchableSectionListScreenBlock: ComponentDef = {
  label: "TemplateSearchableSectionListScreen",
  category: "templates",
  controls: {
    mode: C.select(["sections", "items"], "sections"),
    listState: C.select(["data", "loading", "error", "empty"], "data"),
    hasMore: C.bool(true),
    isLoadingMore: C.bool(false),
    searchPlaceholder: C.txt("Search by name"),
    emptyLabel: C.txt("No results"),
  },
  render: (p) => {
    const mode = p.mode as string;
    const state = p.listState as string;
    const sections =
      state === "data"
        ? mode === "sections"
          ? MOCK_SECTIONS
          : [{ title: "", data: MOCK_ITEMS }]
        : [];

    return (
      <TemplateSearchableSectionListScreen<{ id: string; name: string }>
        header={
          <UiView className="h-10 bg-accent/10 items-center justify-center">
            <UiText className="text-sm text-accent">Header slot</UiText>
          </UiView>
        }
        searchPlaceholder={p.searchPlaceholder as string}
        retryLabel={STORY_BLOCKS.retry}
        retryTitle={STORY_BLOCKS.retry}
        emptyLabel={p.emptyLabel as string}
        sections={sections}
        isLoading={state === "loading"}
        isError={state === "error"}
        hasMore={Boolean(p.hasMore)}
        isLoadingMore={Boolean(p.isLoadingMore)}
        onSearchChange={() => {}}
        onEndReached={() => {}}
        keyExtractor={(item) => item.id}
        renderItem={({ item, isFirst, isLast }) => (
          <UiPressable
            accessibilityRole="button"
            className={`bg-surface px-4 py-3 ${roundingClass(isFirst, isLast)}`}
          >
            <UiText className="text-base font-medium text-foreground">{item.name}</UiText>
          </UiPressable>
        )}
        footer={
          <UiView className="pt-2">
            <UiText className="text-xs text-muted">Footer slot</UiText>
          </UiView>
        }
      />
    );
  },
};
