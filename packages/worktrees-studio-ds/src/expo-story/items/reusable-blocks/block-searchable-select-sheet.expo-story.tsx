import { useCallback, useState } from "react";
import { BlockSearchableSelectSheet } from "../../../components/reusable-blocks";
import { UiView, UiText, UiButton } from "../../../components";
import { TeleportProvider, useTeleport } from "../../../components/teleport";
import type { ComponentDef } from "./index";

const STUDENT_SECTIONS = [
  {
    title: "August - 2025",
    data: [
      { id: "s1", label: "Aisyah Putri", subtitle: "NIS: 20250001" },
      { id: "s2", label: "Zahra Ramadhani", subtitle: "NIS: 20250002" },
    ],
  },
];

const TEACHER_ITEMS = [
  { id: "t1", label: "Siti Aminah", subtitle: "siti@example.com" },
  { id: "t2", label: "Ahmad Fauzi", subtitle: "ahmad@example.com" },
];

function SheetDemo() {
  const { showFullSheet } = useTeleport();
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set(["s1"]));
  const [mode, setMode] = useState<"students" | "teachers">("students");

  const toggle = useCallback((id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const openSheet = useCallback(() => {
    const sheet = showFullSheet(
      <BlockSearchableSelectSheet
        emptyLabel="No results"
        retryLabel="Retry"
        retryTitle="Couldn't load"

        title={mode === "students" ? "Add Students" : "Add Teachers"}
        searchPlaceholder={
          mode === "students" ? "Search students by name" : "Search teachers by name"
        }
        checkedIds={checkedIds}
        sections={mode === "students" ? STUDENT_SECTIONS : undefined}
        items={mode === "teachers" ? TEACHER_ITEMS : undefined}
        hasMore
        searchTestID="story-pick-search"
        rowTestIDPrefix="story-pick-row"
        onSearchChange={() => {}}
        onToggle={toggle}
        onLoadMore={() => {}}
      />,
      <UiButton
        variant="primary"
        className="w-full"
        testID="story-pick-submit"
        onPress={() => sheet.close()}
      >
        Save ({checkedIds.size})
      </UiButton>,
      { title: "Sheet", subtitle: "Detail" }
    );
  }, [checkedIds, mode, showFullSheet, toggle]);

  return (
    <UiView className="flex-1 items-center justify-center p-6 gap-4">
      <UiText className="text-lg font-bold text-foreground">BlockSearchableSelectSheet</UiText>
      <UiText className="text-sm text-muted text-center">
        Mode: {mode} — checked: {Array.from(checkedIds).join(", ") || "none"} — checking toggles
        membership, Save submits the full set
      </UiText>
      <UiView className="flex-row gap-2">
        <UiButton
          variant="secondary"
          size="sm"
          isDisabled={mode === "students"}
          onPress={() => setMode("students")}
        >
          Students (sections)
        </UiButton>
        <UiButton>Teachers (flat)</UiButton>
      </UiView>
      <UiButton variant="primary" size="md" onPress={openSheet}>
        Open Assignment Picker
      </UiButton>
    </UiView>
  );
}

export const BlockSearchableSelectSheetBlock: ComponentDef = {
  label: "BlockSearchableSelectSheet",
  category: "reusable blocks",
  controls: {},
  render: () => (
    <TeleportProvider>
      <SheetDemo />
    </TeleportProvider>
  ),
};
