import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { UiView, MonoText } from "../../../components";
import { useControls } from "../../../hooks/use-controls";
import { ControlPanel } from "../../../expo-story/layouts/control-panel";
import { CasePanel } from "../../../expo-story/layouts/case-panel";
import { usePublishStory } from "../../../expo-story/collab";
import PhoneFrame from "../../../expo-story/layouts/phone-frame";
import { blockRegistry, categories } from "../../../expo-story/items";

export default function BlockPage() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const story = `blocks/${name ?? "unknown"}`;
  usePublishStory(story);

  const entry = name ? categories.flatMap((c) => c.items).find((i) => i.name === name) : null;
  const block = name ? blockRegistry[name] : undefined;

  const cases = block?.cases ?? [];
  const [caseId, setCaseId] = useState<string | undefined>(cases[0]?.id);
  const selectedCase = cases.find((c) => c.id === caseId) ?? cases[0];

  const { props, set, reset, defs } = useControls((block?.controls || {}) as any);
  const renderProps = selectedCase ? { ...selectedCase.props, case: selectedCase.id } : props;

  if (!block || !entry) {
    return (
      <UiView className="flex-1 items-center justify-center p-6">
        <UiView className="rounded-xl p-6 gap-2 bg-surface">
          <MonoText className="text-lg font-bold text-foreground">Component not found</MonoText>
          <MonoText className="text-sm text-muted">
            The component &ldquo;{name}&rdquo; does not exist in the registry.
          </MonoText>
        </UiView>
      </UiView>
    );
  }

  const isCentered = block.category === "heroui-primitive";

  return (
    <UiView className="flex-1 flex-row bg-surface">
      <UiView className="flex-1 items-center justify-center">
        <PhoneFrame story={story}>
          {isCentered ? (
            <UiView className="w-full flex-1 items-center justify-center p-4">
              {block.render(renderProps)}
            </UiView>
          ) : (
            <UiView className="w-full flex-1">{block.render(renderProps)}</UiView>
          )}
        </PhoneFrame>
      </UiView>
      <UiView className="w-[375px] bg-background p-3">
        {selectedCase ? (
          <CasePanel
            label={block.label}
            cases={cases}
            value={selectedCase.id}
            onSelect={setCaseId}
          />
        ) : (
          <ControlPanel defs={defs} values={props} onChange={set} onReset={reset} />
        )}
      </UiView>
    </UiView>
  );
}
