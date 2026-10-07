import { useLocalSearchParams } from "expo-router";
import { UiView, UiText } from "../../../components";
import { useControls } from "../../../hooks/use-controls";
import { useCanvasCollab } from "../../../expo-story/collab";
import { CanvasProvider } from "../../../expo-story/layouts/canvas-context";
import DragCanvas from "../../../expo-story/layouts/drag-canvas";
import { blockRegistry, categories } from "../../../expo-story/items";
import { ActiveFontProvider } from "../../../hooks/use-font";

/** Publishes the canvas pan/zoom and applies the view of the teammate you follow (web collaboration only). */
function FlowCollab({ story }: { story: string }) {
  useCanvasCollab(story);
  return null;
}

export default function FlowPage() {
  const { name } = useLocalSearchParams<{ name: string }>();

  const entry = name ? categories.flatMap((c) => c.items).find((i) => i.name === name) : null;
  const block = name ? blockRegistry[name] : undefined;
  const { props } = useControls((block?.controls || {}) as any);

  if (!block || !entry) {
    return (
      <UiView className="flex-1 items-center justify-center p-6 bg-surface">
        <UiView className="rounded-xl p-6 gap-2 bg-surface">
          <UiText className="text-lg font-bold text-foreground">Flow not found</UiText>
          <UiText className="text-sm text-muted">
            The flow &ldquo;{name}&rdquo; does not exist in the registry.
          </UiText>
        </UiView>
      </UiView>
    );
  }

  return (
    <UiView className="flex-1 bg-surface">
      <CanvasProvider>
        <FlowCollab story={`flows/${name}`} />
        <DragCanvas collabStory={`flows/${name}`}>
          <ActiveFontProvider>{block.render(props)}</ActiveFontProvider>
        </DragCanvas>
      </CanvasProvider>
    </UiView>
  );
}
